import { schema } from '../prosemirror-setup';

exports.createMarkdownMention = function(cm, selectedObject) {
		const currentCursor = cm.getCursor();
		const currentLine = cm.getLine(currentCursor.line);
		const nextChIndex = currentCursor.ch;
		const prevChars = currentLine.substring(0, currentCursor.ch);
		const startIndex = prevChars.lastIndexOf(' ') + 1;

		let content;
		switch (selectedObject.itemType) {
		case 'file':
			content = `![${selectedObject.name}](${selectedObject.name})`;
			break;
		case 'pub':
			content = `[${selectedObject.title}](/pub/${selectedObject.slug})`;
			break;
		case 'reference':
			content = `[@${selectedObject.id}]`;
			break;
		case 'user':
			content = `[${selectedObject.firstName} ${selectedObject.lastName}](/user/${selectedObject.username})`;
			break;
		case 'highlight':
			content = `[@highlight/${selectedObject.id}]`;
			break;
		case 'page':
			content = `[${selectedObject.title}](${selectedObject.journalSlug}/page/${selectedObject.pageSlug})`;
			break;
		default:
			content = '[An Error occured with this @ mention]';
			break;
		}
		cm.replaceRange(content, { line: currentCursor.line, ch: startIndex }, { line: currentCursor.line, ch: nextChIndex });
	};

/* Reference */
/* -------------- */

function insertReference({view, citationData, start, end}) {
	const referenceNode = schema.nodes.reference.create({ citationID: citationData.id });
	let transaction = view.state.tr.replaceRangeWith(start, end, referenceNode);
	transaction = transaction.setMeta('createReference', citationData);
	return view.dispatch(transaction);
}

function insertMention({ start, end, view, url, type, text }) {

	const textnode = schema.text(text);
	const transaction = view.state.tr.replaceRangeWith(start, end, schema.nodes.mention.create({ url, type }, textnode));
	view.dispatch(transaction);
}

/* Embed */
/* -------------- */
function insertEmbed({ view, filename, url, start, end }) {
	const textnode = schema.text('Enter caption.');
	const captionNode = schema.nodes.caption.create({}, textnode);
	const embedNode = schema.nodes.embed.create(
		{
			filename,
			align: 'full',
			size: '50%',
		},
		captionNode
	);
	let transaction;

	transaction = view.state.tr.replaceRangeWith(start, end, embedNode);
	if (url) {
		transaction = transaction.setMeta('uploadedFile', { filename, url });
	}

	view.dispatch(transaction);
}

exports.createRichMention = function(editor, selectedObject, start, end) {

	let text, url, filename;

	switch (selectedObject.itemType) {
		case 'file':
			filename = selectedObject.name;
			if (selectedObject.slug) {
				url = `/pub/${selectedObject.slug}/files/${filename}`;
				text = filename;
				insertMention({ view: editor.view, start, end, text, url, type: 'file' });
			} else {
				insertEmbed({ view: editor.view, filename, start, end });
			}
			break;
		case 'pub':
			text = selectedObject.title;
			url = `/pub/${selectedObject.slug}`;
			insertMention({ view: editor.view, start, end, text, url, type: 'pub' });
			break;
		case 'reference':
			insertReference({ view: editor.view, start, end, citationData: selectedObject });
			break;
		case 'user':
			text = `${selectedObject.firstName} ${selectedObject.lastName}`;
			url = `/user/${selectedObject.username}`;
			insertMention({ view: editor.view, start, end, text, url, type: 'user' });
			break;
		case 'highlight':
			insertMention();
			break;
		default:
			break;
	}

}
