'use strict';

var _prosemirrorSetup = require('../prosemirror-setup');

exports.createMarkdownMention = function (cm, selectedObject) {
	// console.log('Got ', selectedObject);
	var currentCursor = cm.getCursor();
	var currentLine = cm.getLine(currentCursor.line);
	var nextChIndex = currentCursor.ch;
	var prevChars = currentLine.substring(0, currentCursor.ch);
	var startIndex = prevChars.lastIndexOf(' ') + 1;

	var content = void 0;
	switch (selectedObject.itemType) {
		case 'file':
			content = '![' + selectedObject.name + '](' + selectedObject.name + ')';
			break;
		case 'pub':
			content = '[' + selectedObject.title + '](/pub/' + selectedObject.slug + ')';
			break;
		case 'reference':
			content = '[@' + selectedObject.key + ']';
			break;
		case 'user':
			content = '[' + selectedObject.firstName + ' ' + selectedObject.lastName + '](/user/' + selectedObject.username + ')';
			break;
		case 'highlight':
			content = '[@highlight/' + selectedObject.id + ']';
			break;
		default:
			content = '[An Error occured with this @ mention]';
			break;
	}
	cm.replaceRange(content, { line: currentCursor.line, ch: startIndex }, { line: currentCursor.line, ch: nextChIndex });
};

/* Reference */
/* -------------- */
function insertReference(_ref) {
	var view = _ref.view;

	view.dispatch(view.state.tr.setMeta('createCitation', { key: 'testKey', title: 'myRef' }));
}

/* Embed */
/* -------------- */
function insertEmbed(_ref2) {
	var view = _ref2.view,
	    filename = _ref2.filename,
	    url = _ref2.url,
	    start = _ref2.start,
	    end = _ref2.end;

	var textnode = _prosemirrorSetup.schema.text('Enter caption.');
	var captionNode = _prosemirrorSetup.schema.nodes.caption.create({}, textnode);
	var embedNode = _prosemirrorSetup.schema.nodes.embed.create({
		filename: filename,
		align: 'full',
		size: '50%'
	}, captionNode);
	var transaction = void 0;
	if (start && end) {
		transaction = view.state.tr.replaceRangeWith(start, end, embedNode);
	} else {
		transaction = view.state.tr.replaceSelectionWith(embedNode);
	}
	if (url) {
		transaction = transaction.setMeta('uploadedFile', { filename: filename, url: url });
	}

	view.dispatch(transaction);
}

exports.createRichMention = function (editor, selectedObject, start, end) {

	switch (selectedObject.itemType) {
		case 'file':
			var filename = selectedObject.name;
			insertEmbed({ view: editor.view, filename: filename, start: start, end: end });
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
};