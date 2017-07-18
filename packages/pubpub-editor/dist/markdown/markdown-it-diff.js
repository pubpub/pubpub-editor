'use strict';

function diffPlusParser(state, silent) {
	var token = void 0;
	var UNESCAPE_RE = /\\([ \\!"#$%&'()*+,./:;<=>?@[\]^_`{|}~-])/g;
	var max = state.posMax;
	var start = state.pos;

	// if (state.src.charAt(start) !== '[') { return false; }
	if (start + 5 > max) {
		return false;
	}
	if (state.src.substring(start, start + 5) !== '-----') {
		return false;
	}
	if (silent) {
		return false;
	} // don't run any pairs in validation mode

	token = state.push('diff', '', 0);
	token.attrs = [];
	token.attrs.push(['type', 'plus']);

	state.pos = start + 5;
	state.posMax = max;
	return true;
}

function diffNegParser(state, silent) {
	var token = void 0;
	var UNESCAPE_RE = /\\([ \\!"#$%&'()*+,./:;<=>?@[\]^_`{|}~-])/g;
	var max = state.posMax;
	var start = state.pos;

	// if (state.src.charAt(start) !== '[') { return false; }
	if (start + 5 > max) {
		return false;
	}
	if (state.src.substring(start, start + 5) !== '+++++') {
		return false;
	}
	if (silent) {
		return false;
	} // don't run any pairs in validation mode

	token = state.push('diff', '', 0);
	token.attrs = [];
	token.attrs.push(['type', 'minus']);

	state.pos = start + 5;
	state.posMax = max;
	return true;
}

module.exports = function referencePlugin(md) {
	md.inline.ruler.push('diffplus', diffPlusParser);
	md.inline.ruler.push('diffneg', diffNegParser);
};