import React, { Component } from 'react';
import IframeEditable from './IframeEditable';
import IframeStatic from './IframeStatic';

/**
* @module Addons
*/

/**
* @component
*
* Enable iFrames in your document
*
* @example
return (
	<Editor>
		<Iframe />
	</Editor>
);
*/
class Iframe extends Component {
	static schema = ()=> {
		return {
			nodes: {
				iframe: {
					atom: true,
					// content: 'inline*',
					attrs: {
						url: { default: '' },
						size: { default: 75 }, // number as percentage
						height: { default: 419 },
						align: { default: 'center' },
						caption: { default: '' },
					},
					parseDOM: [{
						tag: 'iframe',
						getAttrs: (node)=> {
							return {
								url: node.getAttribute('src') || '',
								size: Number(node.getAttribute('data-size')) || 75,
								height: Number(node.getAttribute('height')) || 419,
								align: node.getAttribute('data-align') || 'center',
								caption: node.getAttribute('alt') || '',
							};
						}
					}],
					toDOM: (node)=> {
						return ['iframe', {
							src: node.attrs.url,
							'data-size': node.attrs.size,
							height: node.attrs.height,
							'data-align': node.attrs.align,
							alt: node.attrs.caption,
						}];
					},
					inline: false,
					group: 'block',
					draggable: false,
					selectable: true,
					insertMenu: {
						label: 'Insert iFrame',
						icon: 'pt-icon-code-block',
						onInsert: (view) => {
							const iframeNode = view.state.schema.nodes.iframe.create();
							const transaction = view.state.tr.replaceSelectionWith(iframeNode);
							view.dispatch(transaction);
						},
					},
					toEditable(node, view, decorations, isSelected, helperFunctions) {
						return (
							<IframeEditable
								node={node}
								caption={node.attrs.caption}
								url={node.attrs.url}
								align={node.attrs.align}
								size={node.attrs.size}
								height={node.attrs.height}
								isSelected={isSelected}
								view={view}
								{...helperFunctions}
							/>
						);
					},
					toStatic(node) {
						return (
							<IframeStatic
								key={node.currIndex}
								align={node.attrs.align}
								url={node.attrs.url}
								size={node.attrs.size}
								height={node.attrs.height}
								caption={node.attrs.caption}
							/>
						);
					},
				},
			}
		};
	};

	render() {
		return null;
	}
}

export default Iframe;
