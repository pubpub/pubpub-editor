import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import HighlightQuote from './HighlightQuote';

require('./highlightQuote.scss');

// const propTypes = {
// 	/* All addons get the following props,
// 	but certain schema-based addons may not need them */
// 	// containerId: PropTypes.string.isRequired,
// 	// view: PropTypes.object.isRequired,
// 	// editorState: PropTypes.object.isRequired,
// };
// const defaultProps = {
// };

class HighlightQuoteAddon extends Component {
	static schema = ()=> {
		return {
			nodes: {
				highlightQuote: {
					atom: true,
					attrs: {
						to: { default: null },
						from: { default: null },
						id: { default: null },
						exact: { default: null },
						suffix: { default: null },
						prefix: { default: null },
						version: { default: null },
					},
					parseDOM: [{
						tag: 'highlightquote',
						getAttrs: (node)=> {
							return {
								to: node.getAttribute('data-to') || null,
								from: node.getAttribute('data-from') || null,
								id: node.getAttribute('data-id') || null,
								exact: node.getAttribute('data-exact') || null,
								suffix: node.getAttribute('data-suffix') || null,
								prefix: node.getAttribute('data-prefix') || null,
								version: node.getAttribute('data-version') || null,
							};
						}
					}],
					toDOM: (node)=> {
						return ['highlightquote', {
							'data-to': node.attrs.to,
							'data-from': node.attrs.from,
							'data-id': node.attrs.id,
							'data-exact': node.attrs.exact,
							'data-suffix': node.attrs.suffix,
							'data-prefix': node.attrs.prefix,
							'data-version': node.attrs.version,
						}];
					},
					inline: false,
					group: 'block',
					draggable: false,
					selectable: true,
					toEditable(node, view, decorations, isSelected) {
						return (
							<HighlightQuote
								to={node.attrs.to}
								from={node.attrs.from}
								id={node.attrs.id}
								exact={node.attrs.exact}
								suffix={node.attrs.suffix}
								prefix={node.attrs.prefix}
								version={node.attrs.version}
								isSelected={isSelected}
							/>
						);
					},
					toStatic(node) {
						return (
							<HighlightQuote
								to={node.attrs.to}
								from={node.attrs.from}
								id={node.attrs.id}
								exact={node.attrs.exact}
								suffix={node.attrs.suffix}
								prefix={node.attrs.prefix}
								version={node.attrs.version}
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

// HighlightQuoteAddon.propTypes = propTypes;
// HighlightQuoteAddon.defaultProps = defaultProps;
export default HighlightQuoteAddon;
