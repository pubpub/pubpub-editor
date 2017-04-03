function referenceParser(state, silent) {
	let token;
	const UNESCAPE_RE = /\\([ \\!"#$%&'()*+,./:;<=>?@[\]^_`{|}~-])/g;
	const max = state.posMax;
	const start = state.pos;

	// if (state.src.charAt(start) !== '[') { return false; }
	if (start + 2 >= max) { return false; }
	if (state.src.substring(start, start+2) !== '[@') { return false; }
	if (silent) { return false; } // don't run any pairs in validation mode


	state.pos = start + 1;
	while (state.pos < max) {
		if (state.src.charAt(state.pos) === ']') { break; }
		state.pos += 1;
	}

	if (start + 1 === state.pos) { state.pos = start; return false; }

	const content = state.src.slice(start + 1, state.pos);
	if (content.match(/(^|[^\\])(\\\\)*[\n]/)) { state.pos = start; return false; }

	state.posMax = state.pos;
	state.pos = start + 1;

	// Earlier we checked !silent, but this implementation does not need it

	token = state.push('reference', '', 0);
	token.attrs = [];
	const citationID = content.replace(UNESCAPE_RE, '$1');
	token.attrs.push(['citationID', citationID]);

	state.pos = state.posMax + 1;
	state.posMax = max;
	return true;
}

module.exports = function referencePlugin(md) {
	md.inline.ruler.push('reference', referenceParser);
};
