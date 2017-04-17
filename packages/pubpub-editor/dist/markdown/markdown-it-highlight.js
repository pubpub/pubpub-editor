'use strict';

function highlightParser(state, silent) {
	var token = void 0;
	var UNESCAPE_RE = /\\([ \\!"#$%&'()*+,./:;<=>?@[\]^_`{|}~-])/g;
	var max = state.posMax;
	var start = state.pos;

	// if (state.src.charAt(start) !== '[') { return false; }
	if (state.src.substring(0, 12) !== '[@highlight/') {
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

	token = state.push('highlight', '', 0);
	token.attrs = [];
	var highlightID = content.replace(UNESCAPE_RE, '$1');
	token.attrs.push(['highlightID', highlightID]);

	state.pos = state.posMax + 1;
	state.posMax = max;
	return true;
}

module.exports = function highlightPlugin(md) {
	md.inline.ruler.before('reference', 'highlight', highlightParser);
	// md.inline.ruler.push('highlight', highlightParser);
};