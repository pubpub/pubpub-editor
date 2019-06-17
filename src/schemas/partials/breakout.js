export default (node, element) => {
	const { breakout } = node.attrs;
	if (breakout) {
		element.setAttribute('data-align-breakout', true);
	} else {
		element.removeAttribute('data-align-breakout');
	}
};
