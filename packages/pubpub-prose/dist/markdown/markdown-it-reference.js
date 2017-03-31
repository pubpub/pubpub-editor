'use strict';

function referenceParser(state, silent) {
	var token = void 0;
	var UNESCAPE_RE = /\\([ \\!"#$%&'()*+,./:;<=>?@[\]^_`{|}~-])/g;
	var max = state.posMax;
	var start = state.pos;

	// if (state.src.charAt(start) !== '[') { return false; }
	if (state.src.substring(0, 2) !== '[@') {
		return false;
	}
	if (silent) {
		return false;
	} // don't run any pairs in validation mode
	if (start + 2 >= max) {
		return false;
	}

	state.pos = start + 1;
	while (state.pos < max) {
		if (state.src.charAt(state.pos) === ']') {
			break;
		}
		state.pos += 1;
	}

	if (start + 1 === state.pos) {
		state.pos = start;return false;
	}

	var content = state.src.slice(start + 1, state.pos);
	if (content.match(/(^|[^\\])(\\\\)*[\n]/)) {
		state.pos = start;return false;
	}

	state.posMax = state.pos;
	state.pos = start + 1;

	// Earlier we checked !silent, but this implementation does not need it
	token = state.push('reference_open', 'reference', 1);

	token = state.push('text', '', 0);
	token.content = content.replace(UNESCAPE_RE, '$1');

	token = state.push('reference_close', 'reference', -1);

	state.pos = state.posMax + 1;
	state.posMax = max;
	return true;
}

module.exports = function referencePlugin(md) {
	md.inline.ruler.push('reference', referenceParser);
};