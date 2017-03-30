import { schema } from '../prosemirror-setup';

exports.createMarkdownMention = function(cm, selectedObject) {
		// console.log('Got ', selectedObject);
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
			content = `[@${selectedObject.key}]`;
			break;
		case 'user':
			content = `[${selectedObject.firstName} ${selectedObject.lastName}](/user/${selectedObject.username})`;
			break;
		case 'highlight':
			content = `[@highlight/${selectedObject.id}]`;
			break;
		default:
			content = '[An Error occured with this @ mention]';
			break;
		}
		cm.replaceRange(content, { line: currentCursor.line, ch: startIndex }, { line: currentCursor.line, ch: nextChIndex });
	};

/* Reference */
/* -------------- */
function insertReference({view}) {
	view.dispatch(view.state.tr.setMeta('createCitation', { key: 'testKey', title: 'myRef' }));
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

	switch (selectedObject.itemType) {
		case 'file':
			const filename = selectedObject.name;
			insertEmbed({ view: editor.view, filename, start, end });
			break;
		case 'pub':
			insertMention();
			break;
		case 'reference':
			insertReference({ view: editor.view });
			break;
		case 'user':
			insertMention();
			break;
		case 'highlight':
			insertMention();
			break;
		default:
			break;
	}

}
