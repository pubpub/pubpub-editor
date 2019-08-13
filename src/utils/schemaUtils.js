import React from 'react';

export const firebaseTimestamp = { '.sv': 'timestamp' };

export const renderHtmlChildren = (node, html) => {
	const hasKey = node.attrs.key !== undefined;
	if (hasKey) {
		/* eslint-disable-next-line react/no-danger */
		return <span key={node.attrs.key} dangerouslySetInnerHTML={{ __html: html }} />;
	}

	const outputElem = document.createElement('span');
	outputElem.innerHTML = html;
	return outputElem;
};

export const generateStyles = (attrs) => {
	let width = attrs.size ? `${attrs.size}%` : undefined;
	if (attrs.align === 'full') {
		width = '100%';
	}
	return {
		width: width,
		height: attrs.height ? `${attrs.height}%` : undefined,
	};
};
