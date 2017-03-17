/*
 *
 */

var write = require('fs-writefile-promise');
var csltoBibtex = require('@pubpub/prose/dist/references/csltobibtex').csltoBibtex;

/*
* @options { bibFile }
*
*/
function ppubToPandoc(ppub, options) {

	var currentPpubNodeParents = []; // stack for keeping track of the last node : )
	var currentPandocNodeParents = []; // stack for keeping track of the last output node
	var blocks = []; // blocks (pandoc AST) is eventually set to this array.
	var pandocJSON = {};
	var inTable = false;
	var bibData = [];
	var col; // used when within a table, to keep track of current pandoc col
	var row; // used when within a table, to keep track of current pandoc row
	var itemCountBib = 1;
	var bibFile = (options && options.bibFile) ? options.bibFile : Math.random().toString(36).substring(7)  + '.bib';
	var refItemNumber = 1;
	var listDepthStack = []; // A stack for keeping track of which node on a list we are on
	var metadata = (typeof options !== 'undefined' && options.metadata) ? options.metadata : {};

	function isLeafNode(node) {
		if (node.t === 'Str' || node.t === 'Space' || node.t === 'Cite') {
			return true;
		}
		return false;
	}

	/* Pandoc has a Str node for each word and space, this function converts
	* strings to Pandocs format
	*/
	function createTextNodes(str) {

		var newNodes = [];
		str = str.split(' ');

		for (var i = 0; i < str.length; i++) {
			newNodes.push({ t: 'Str', c: str[i] });
			if (i < str.length - 1) {
				newNodes.push({ t: 'Space' });
			}
		}
		return newNodes;
	}


	// Create a node
	// If node is a root node, push it to blocks array
	function scan(node) {
		// green(`\nBlocks:\t${JSON.stringify(blocks)}\nParentNodes:\t${JSON.stringify(currentPpubNodeParents)}\nOutputParentNodes:\t${JSON.stringify(currentPandocNodeParents)}\n`)
		var newNode = { t: undefined, c: [] };
		var newerNodes = []; // Used primarily for strong, emphasis, link, code text
		var markCount = 0; // Used to count strong, emphasis, link, code text, the reason being that you can have newer nodes that aren't marks

		switch (node.type) {
			case 'article':
			newNode.t = 'DoNotAddThisNode';
			break;

			case 'heading':
			var level = node.attrs.level;
			newNode.t = 'Header';
			newNode.c[0] = level;
			newNode.c[1] = ['', [], []];
			newNode.c[2] = [];
			break;
			case 'text':
			// Marks are handled here and the rest of it is handled later
			if (node.marks) {
				for (var i = 0; i < node.marks.length; i++) {
					var newerNode;
					if (node.marks[i].type === 'em') {
						newerNode = {};
						newerNode.t = 'Emph';
						newerNode.c = [];
						newerNodes.push(newerNode);
						markCount++;
					} else if (node.marks[i].type === 'strong') {
						newerNode = {};
						newerNode.t = 'Strong';
						newerNode.c = [];
						newerNodes.push(newerNode);
						markCount++;
					} else if (node.marks[i].type === 'link') {
						newerNode = {};
						newerNode.t = 'Link';
						newerNode.c = [['', [], []], [], [node.content.text, node.marks[i].attrs.title || '']];
						newerNodes.push(newerNode);
						markCount++;
					} else if (node.marks[i].type === 'code') {
						newerNode = {};
						newerNode.t = 'Code';
						newerNode.c = [['', [], []], node.text];
						newerNodes.push(newerNode);
						markCount++;
					} else if (node.marks[i].type === 'strike') {
						// This is an edge case and handled differently in Pandoc than link, code, strong and emph
						newNode.t = 'Strikeout';
					} else if (node.marks[i].type === 'sub') {
						// This is an edge case and handled differently in Pandoc than link, code, strong and emph
						newNode.t = 'Subscript';
					} else if (node.marks[i].type === 'sup') {
						// This is an edge case and handled differently in Pandoc than link, code, strong and emph
						newNode.t = 'Superscript';
					}
				}
			}

			break;
			case 'paragraph':
			// Let's actually create Paragraph nodes when text nodes are seen, as opposed to when paragraph nodes are seen
			if (currentPpubNodeParents[currentPpubNodeParents.length - 1].type === 'list_item') {
				newNode.t = 'Plain';
				break;
			} else if (inTable && currentPandocNodeParents[currentPandocNodeParents.length-1].t === 'Plain' && currentPandocNodeParents[currentPandocNodeParents.length-2].t === 'Table') {
				newNode.t = 'DoNotAddThisNode';
			} else {
				// This is the proper way to handle Para -- one to one with ppub paragraph
				// Because otherwise have issues with Para : [text, text]
				newNode.t = 'Para';
			}

			break;
			case 'horizontal_rule':
			newNode.t = 'HorizontalRule';
			break;
			case 'blockquote':
			newNode.t = 'BlockQuote';
			break;
			case 'bullet_list':
			newNode.t = 'BulletList';

			listDepthStack.push(-1);
			break;
			case 'ordered_list':
			newNode.t = 'OrderedList';
			newNode.c[0] = [
				1, {
					t: 'DefaultStyle'
				},
				{
					t: 'Period'
				}
			];
			newNode.c[1] = [];
			listDepthStack.push(-1);
			break;
			case 'list_item':
			newNode.t = 'DoNotAddThisNode';

			var depth = listDepthStack[listDepthStack.length - 1] + 1;
			listDepthStack[listDepthStack.length - 1] = depth;
			var parent = currentPandocNodeParents[currentPandocNodeParents.length - 1];
			if (parent.t === 'OrderedList'){
				parent.c[1][depth] = [];
			} else {
				parent.c[depth] = [];
			}
			break;
			case 'table':
			inTable = true;
			// This doesn't work for nested tables.
			col = -1;
			row = -1;
			newNode.t = 'Table';
			newNode.c[0] = [];
			newNode.c[1] = []; // Should have {t: "AlignDefault"} for every column
			newNode.c[2] = []; // Should have a 0 for every column
			newNode.c[3] = []; // Column Titles
			newNode.c[4] = []; // Column content
			var columns = node.attrs.columns;
			for (var i = 0; i < columns; i++) {
				newNode.c[1].push({ t: 'AlignDefault' });
				newNode.c[2].push(0);
			}
			break;
			case 'table_row':
			newNode.t = 'DoNotAddThisNode';
			row++;
			col = -1;
			break;
			case 'table_cell':
			col++;
			newNode.t = 'Plain';
			break;
			case 'block_embed': // Cases: Image in table
			case 'embed':
			newNode.t = 'Image';
			newNode.c[0] = ['', [], []];
			// if has width & height
			if (node.attrs && node.attrs.size) { // Images in the newer editor use embe not image
				var widthHeightPercentage = '' + node.attrs.size;
				newNode.c[0][2] = [['width', widthHeightPercentage], ['height', widthHeightPercentage]]
			}
			var alignment = node.attrs.align; // is either left, right or full
			// alignment is not fully supported in pandoc quite yet
			var caption = node.attrs.caption;
			if (!caption) {
				caption = node.content && node.content[0] && node.content[0].content[0] ? node.content[0].content[0].text : '';
			}
			newNode.c[1] = caption ? createTextNodes(caption) : [];
			newNode.c[2] = [node.attrs.url || node.attrs.data.content.url, node.attrs.figureName || ''];
			break;
			case 'citations':
			// Create a header node that goes above that says 'References'

			var aboveNode = { t: 'Header', c: [1, ['references', ['unnumbered'], []], [{ t:'Str', 'c':'References' }]]};
			// insert this node at the root
			blocks.push(aboveNode)
			newNode.t = 'DoNotAddThisNode';

			break;
			case 'reference':
			// Footnote
			var citationId = node.attrs.citationID + '';

			newNode.t = 'Cite';
			newNode.c = [
				[
					{
						citationSuffix: [

						],
						citationNoteNum: 0,
						citationMode: {
							t: 'AuthorInText'
						},
						citationPrefix: [

						],
						citationId: citationId,
						citationHash: 1 // Idk what this is
					}
				],
				[]
			];

			break;
			case 'citation':
			newNode.t = 'DoNotAddThisNode';
			var data = node.attrs.data;
			bibData.push(data);
			break;
			case 'latex':
			newNode.t = 'Math';
			newNode.c = [
				{
					t: 'InlineMath'
				},
				node.content[0].text
			];

			break;
			case 'code_block':
			newNode.t = 'CodeBlock';
			newNode.c[0] = ['',[],[]];
			newNode.c[1] = node.content[0].text;
			break;
			default:
			newNode.t = 'DoNotAddThisNode';
			break;
		}

		// Wrap all images in a para block, because Pandoc seems to do this,
		// at least in does it in files where there is just an image. It'll break if you don't
		if (newNode.t === 'Image') {
			var para = {};
			para.t = 'Para';
			para.c = [];
			newerNodes.push(para);
			markCount++;
		}

		// If there are any node to add before the target node, like mark nodes,
		// add them here
		for (var i = 0; i < newerNodes.length; i++) {
			addNode(newerNodes[i]);
		}

		if (newNode.t === 'Strikeout' || newNode.t === 'Subscript' || newNode.t === 'Superscript') {
			// Strikeout is handled differently than other text nodes
			newNode.c = createTextNodes(node.text);
			addNode(newNode);
		} else if (node.type === 'text') {  // should this be or plain? o:
			var isCode = false;
			if (node.marks) {
				for (var i = 0; i < node.marks.length; i++) {
					if (node.marks[i].type === 'code') {
						isCode = true;
					}
				}
			}
			if (!isCode) {
				var parent = currentPandocNodeParents[currentPandocNodeParents.length - 1];
				var newNodes = createTextNodes(node.text);


				for (var i in newNodes) {
					addNode(newNodes[i]);
				}
			}
		} else {
			addNode(newNode);
		}

		scanFragment(node);

		if (node.type === 'paragraph' || node.type === 'heading'
		|| node.type === 'horizontal_rule' || node.type === 'blockquote'
		|| node.type === 'bullet_list' || node.type === 'ordered_list'
		|| node.type === 'list_item' || node.type === 'table'
		|| node.type === 'table_row' || node.type === 'table_cell'
		|| node.type === 'block_embed' || node.type === 'text'
		|| node.type === 'embed' || node.type === 'latex'
		|| node.type === 'reference' || node.type === 'citation'
		|| node.type === 'citations') {
			currentPpubNodeParents.pop();
		}
		if (newNode.t === 'Para' || newNode.t === 'Plain'
		|| newNode.t === 'Header' || newNode.t === 'Code'
		|| newNode.t === 'HorizontalRule' || newNode.t === 'BlockQuote'
		|| newNode.t === 'BulletList' || newNode.t === 'OrderedList'
		|| newNode.t === 'Table' || newNode.t === 'Image'
		|| newNode.t === 'Note' || newNode.t === 'Link'
		|| newNode.t === 'Superscript') {
			// Link is for the case UL->[Link, Str]
			currentPandocNodeParents.pop();
		} else if (inTable) {
			if (newNode.t === 'Plain') {
				currentPandocNodeParents.pop();
			}
		}

		while (markCount > 0) {
			markCount--;
			currentPandocNodeParents.pop();
		}

		if (node.type === 'table') {
			inTable = false;
		}

		if (node.type === 'bullet_list' || node.type === 'ordered_list') {
			listDepthStack.pop();
		}
	}

	// Link a node to a parent node, or make it a parent
	function addNode(newNode) {
		var parent = currentPandocNodeParents[currentPandocNodeParents.length - 1];

		if (newNode.t === 'DoNotAddThisNode') {
			return;
		}

		if (!parent) {
			currentPandocNodeParents.push(newNode);
			blocks.push(newNode);
			return;
		}

		switch (parent.t) {
			case 'Table':
			if (row < 1) {
				if (!parent.c[3][col]) {
					parent.c[3][col] = [];
				}
				parent.c[3][col].push(newNode);
			} else {
				if (!parent.c[4][row - 1]) {
					parent.c[4][row - 1] = [];
				}
				if (!parent.c[4][row - 1][col]) {
					parent.c[4][row - 1][col] = [];
				}

				parent.c[4][row - 1][col].push(newNode);
			}
			currentPandocNodeParents.push(newNode);
			break;
			case 'Link':
			case 'Code':
			case 'Strikeout':
			parent.c[1].push(newNode);
			isLeafNode(newNode) ? undefined : currentPandocNodeParents.push(newNode);
			break;
			case 'BulletList':
			var depth = listDepthStack[listDepthStack.length - 1];
			if (depth === -1) {
				depth = listDepthStack[listDepthStack.length - 2];
			}
			parent.c[depth].push(newNode);
			currentPandocNodeParents.push(newNode); // Ahh may be buggy

			break;
			case 'OrderedList':
			var depth = listDepthStack[listDepthStack.length - 1];
			if (depth === -1) {
				depth = listDepthStack[listDepthStack.length - 2];

			}
			parent.c[1][depth].push(newNode);

			currentPandocNodeParents.push(newNode); // Ahh may be buggy
			break;
			case 'CodeBlock':
			case 'Math':
			// Don't do anything
			break;
			case 'Cite':
			parent.c.push(newNode);
			break;
			case 'BlockQuote':
			case 'Para':
			case 'Emph':
			case 'Strong':
			case 'Plain':
			parent.c.push(newNode);
			if ((parent.t !== 'Para' && parent.t !== 'Plain') || (parent.t === 'Plain' && inTable)) {
				isLeafNode(newNode) ? undefined : currentPandocNodeParents.push(newNode);
			} else if (parent.t === 'Emph' || parent.t === 'Strong') {
				currentPandocNodeParents.push(newNode);
			} else if (parent.t === 'Para' || parent.t === 'Plain') {
				// Wasn't doing this to Plain before, not sure why.
				isLeafNode(newNode) ? undefined : currentPandocNodeParents.push(newNode);
			} else if (parent.t === 'Note') {
				currentPandocNodeParents.push(newNode);
			}
			break;
			case 'Note':
			parent.c.push(newNode);
			currentPandocNodeParents.push(newNode);
			break;
			case 'Div':
			parent.c[1].push(newNode);
			break;
			case 'Image':
			return;
			default:
			parent.c[2].push(newNode);
			break;
		}

	}

	function scanFragment(fragment) {
		currentPpubNodeParents.push(fragment);
		if (fragment.content) {
			fragment.content.forEach((child, offset) => scan(child));
		}
	}

	/* Write the file, and convert it back to make sure it was successful :D
	*********************************************************************
	*********************************************************************/

	function finish(fl) {
		var i;
		if (blocks.length === 0) {
			throw new Error('Conversion failed');
		}


		for (i = 0; i < bibData.length; i++) {
			bibData[i].label = bibData[i].id;
		}

		var bibContents = csltoBibtex(bibData);

		return write(bibFile, bibContents)
		.then(function() {
			pandocJSON.blocks = blocks;
			pandocJSON['pandoc-api-version'] = [
				1,
				17,
				0,
				4
			];
			pandocJSON.meta = {};

			if (metadata['authors']) {
				pandocJSON.meta.author = {
					t: 'MetaList',
					c: []
				};

				for (var i = 0; i < metadata.authors.length; i++){
					var author = {
						t: 'MetaInlines',
						c: createTextNodes(metadata.authors[i])
					};
					pandocJSON.meta.author.c.push(author);
				}
			}

			if (metadata['past-degrees']) {
				pandocJSON.meta.pubprevdegrees = {
					t: 'MetaList',
					c: []
				};

				for (var i = 0; i < metadata['past-degrees'].length; i++){
					var prevdegrees = {
						t: 'MetaInlines',
						c: createTextNodes(metadata['past-degrees'][i])
					};
					pandocJSON.meta.pubprevdegrees.c.push(prevdegrees);
				}

			}

			// if (!metadata.title) {
			// 	metadata.title = 'Untitled';
			// }

			if (metadata['title']) {

				pandocJSON.meta.title = {

					t: 'MetaInlines',
					c: createTextNodes(metadata.title)

				};
			}
			if (metadata['degree']) {
				pandocJSON.meta.pubdegree = {
					t: 'MetaInlines',
					c: createTextNodes(metadata['degree'])
				};
			}
			if (metadata['university']) {
				pandocJSON.meta.pubuniversity = {
					t: 'MetaInlines',
					c: createTextNodes(metadata['university'])
				};
			}
			if (metadata['date']) {
				pandocJSON.meta.pubdate = {
					t: 'MetaInlines',
					c: createTextNodes(metadata['date'])
				};
			}
			if (metadata['supervisor-name']) {
				pandocJSON.meta.pubsupervisorname = {
					t: 'MetaInlines',
					c: createTextNodes(metadata['supervisor-name'])
				};
			}
			if (metadata['supervisor-title']) {
				pandocJSON.meta.pubsupervisortitle = {
					t: 'MetaInlines',
					c: createTextNodes(metadata['supervisor-title'])
				};
			}
			if (metadata['department-chairman-name']) {
				pandocJSON.meta.pubchairmanname = {
					t: 'MetaInlines',
					c: createTextNodes(metadata['department-chairman-name'])
				};
			}
			if (metadata['department-chairman-title']) {
				pandocJSON.meta.pubchairmantitle = {
					t: 'MetaInlines',
					c: createTextNodes(metadata['department-chairman-title'])
				};
			}
			if (metadata['acknowledgements']) {
				pandocJSON.meta.pubacknowledgements = {
					t: 'MetaInlines',
					c: createTextNodes(metadata['acknowledgements'])
				};
			}
			if (metadata['abstract']) {
				pandocJSON.meta.pubabstract = {
					t: 'MetaInlines',
					c: createTextNodes(metadata['abstract'])
				};
			}
			if (metadata['degree-month']) {
				pandocJSON.meta.pubdegreemonth = {
					t: 'MetaInlines',
					c: createTextNodes(metadata['degree-month'])
				};
			}
			if (metadata['degree-year']) {
				pandocJSON.meta.pubdegreeyear = {
					t: 'MetaInlines',
					c: createTextNodes(metadata['degree-year'])
				};
			}
			if (metadata['thesis-date']) {
				pandocJSON.meta.pubthesisdate = {
					t: 'MetaInlines',
					c: createTextNodes(metadata['thesis-date'])
				};
			}
			if (metadata['department']) {
				pandocJSON.meta.pubdepartment = {
					t: 'MetaInlines',
					c: createTextNodes(metadata['department'])
				};
			}

			if (metadata['reader-one-name']) {
				pandocJSON.meta.pubreaderonename = {
					t: 'MetaInlines',
					c: createTextNodes(metadata['reader-one-name'])
				};
			}
			if (metadata['reader-one-title']) {
				pandocJSON.meta.pubreaderonetitle = {
					t: 'MetaInlines',
					c: createTextNodes(metadata['reader-one-title'])
				};
			}
			if (metadata['reader-one-affiliation']) {
				pandocJSON.meta.pubreaderoneaffiliation = {
					t: 'MetaInlines',
					c: createTextNodes(metadata['reader-one-affiliation'])
				};
			}

			if (metadata['reader-two-name']) {
				pandocJSON.meta.pubreadertwoname = {
					t: 'MetaInlines',
					c: createTextNodes(metadata['reader-two-name'])
				};
			}
			if (metadata['reader-two-title']) {
				pandocJSON.meta.pubreadertwotitle = {
					t: 'MetaInlines',
					c: createTextNodes(metadata['reader-two-title'])
				};
			}

			if (metadata['reader-two-affiliation']) {
				pandocJSON.meta.pubreadertwoaffiliation = {
					t: 'MetaInlines',
					c: createTextNodes(metadata['reader-two-affiliation'])
				};
			}

			if (metadata['pub-readers']) {

				for (var i = 0; i < metadata['pub-readers'].length; i++){

					pandocJSON.meta["pubreaders-"+i+"-name"] = {
						t: 'MetaInlines',
						c: createTextNodes(metadata['pub-readers'][i].name)
					};
					pandocJSON.meta["pubreaders-"+i+"-title"] = {
						t: 'MetaInlines',
						c: createTextNodes(metadata['pub-readers'][i].title)
					};
					pandocJSON.meta["pubreaders-"+i+"-affiliation"] = {
						t: 'MetaInlines',
						c: createTextNodes(metadata['pub-readers'][i].affiliation)
					};
				}

			}

			console.log(JSON.stringify(pandocJSON));
			return pandocJSON;
		})
		.catch(function(error) {
			console.log(error);
		});
	}

	scanFragment(ppub, 0);

	return finish();
}

// if (process.argv[2]) {
// 	ppubToPandoc(require(`./${process.argv[2]}`));
// } else {
	exports.ppubToPandoc = ppubToPandoc;
// }
