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
		case 'page':
			content = '[' + selectedObject.title + '](' + selectedObject.journalSlug + '/page/' + selectedObject.pageSlug + ')';
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
	var view = _ref.view,
	    citationData = _ref.citationData,
	    start = _ref.start,
	    end = _ref.end;

	var referenceNode = _prosemirrorSetup.schema.nodes.reference.create({ citationID: citationData.id });
	var transaction = view.state.tr.replaceRangeWith(start, end, referenceNode);
	transaction = transaction.setMeta('createReference', citationData);
	return view.dispatch(transaction);
}

function insertMention(_ref2) {
	var start = _ref2.start,
	    end = _ref2.end,
	    view = _ref2.view,
	    url = _ref2.url,
	    type = _ref2.type,
	    text = _ref2.text;

	var transaction = view.state.tr.replaceRangeWith(start, end, _prosemirrorSetup.schema.nodes.mention.create({ url: url, type: type, text: text }));
	view.dispatch(transaction);
}

/* Embed */
/* -------------- */
function insertEmbed(_ref3) {
	var view = _ref3.view,
	    filename = _ref3.filename,
	    url = _ref3.url,
	    start = _ref3.start,
	    end = _ref3.end;

	var textnode = _prosemirrorSetup.schema.text('Enter caption.');
	var captionNode = _prosemirrorSetup.schema.nodes.caption.create({}, textnode);
	var embedNode = _prosemirrorSetup.schema.nodes.embed.create({
		filename: filename,
		align: 'full',
		size: '50%'
	}, captionNode);
	var transaction = void 0;

	transaction = view.state.tr.replaceRangeWith(start, end, embedNode);
	if (url) {
		transaction = transaction.setMeta('uploadedFile', { filename: filename, url: url });
	}

	view.dispatch(transaction);
}

exports.createRichMention = function (editor, selectedObject, start, end) {

	var text = void 0,
	    url = void 0,
	    filename = void 0;

	console.log('Selected object', selectedObject);
	switch (selectedObject.itemType) {
		case 'file':
			filename = selectedObject.name;
			insertEmbed({ view: editor.view, filename: filename, start: start, end: end });
			break;
		case 'pub':
			text = selectedObject.title;
			url = '/pub/' + selectedObject.slug;
			insertMention({ view: editor.view, start: start, end: end, text: text, url: url, type: 'pub' });
			break;
		case 'reference':
			console.log('CHOSE', selectedObject);
			insertReference({ view: editor.view, start: start, end: end, citationData: selectedObject });
			break;
		case 'user':
			text = selectedObject.firstName + ' ' + selectedObject.lastName;
			url = '/user/' + selectedObject.username;
			insertMention({ view: editor.view, start: start, end: end, text: text, url: url, type: 'user' });
			break;
		case 'highlight':
			insertMention();
			break;
		default:
			break;
	}
};