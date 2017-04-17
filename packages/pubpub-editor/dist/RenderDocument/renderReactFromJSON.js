'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.renderReactFromJSON = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _renderComponents = require('./renderComponents');

var _references = require('../references');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
CSL engine API endpoint...
- serialize each reference decorations?
*/

var renderReactFromJSON = exports.renderReactFromJSON = function renderReactFromJSON(doc, fileMap, allReferences) {

	var engine = new _references.CitationEngine();
	engine.setBibliography(allReferences);

	var meta = { fileMap: fileMap, allReferences: allReferences, engine: engine };

	var content = renderSubLoop(doc.content, meta);
	return _react2.default.createElement(
		'div',
		null,
		content
	);
};

var renderSubLoop = function renderSubLoop(item, meta) {
	if (!item) {
		return null;
	}

	var content = item.map(function (node, index) {
		switch (node.type) {
			case 'heading':
				if (!node.content) {
					return null;
				}
				var id = node.content[0] && node.content[0].text && node.content[0].text.trim().replace(/[^A-Za-z0-9 ]/g, '').replace(/\s/g, '-').toLowerCase();
				return _react2.default.createElement('h' + node.attrs.level, { key: index, id: id }, renderSubLoop(node.content, meta));
			case 'blockquote':
				return _react2.default.createElement(
					'blockquote',
					{ key: index },
					renderSubLoop(node.content, meta)
				);
			case 'ordered_list':
				return _react2.default.createElement(
					'ol',
					{ start: node.attrs.order === 1 ? null : node.attrs.oder, key: index },
					renderSubLoop(node.content, meta)
				);
			case 'bullet_list':
				return _react2.default.createElement(
					'ul',
					{ key: index },
					renderSubLoop(node.content, meta)
				);
			case 'list_item':
				return _react2.default.createElement(
					'li',
					{ key: index },
					renderSubLoop(node.content, meta)
				);
			case 'horizontal_rule':
				return _react2.default.createElement('hr', { key: index });
			case 'code_block':
				return _react2.default.createElement(
					'pre',
					{ key: index },
					_react2.default.createElement(
						'code',
						null,
						renderSubLoop(node.content, meta)
					)
				);
			case 'paragraph':
				// console.log((node.content));
				return _react2.default.createElement(
					'div',
					{ className: 'p-block', key: index },
					renderSubLoop(node.content, meta)
				);
			case 'page_break':
				return _react2.default.createElement(
					'div',
					{ className: 'pagebreak', key: index },
					'pagebreak'
				);
			case 'image':
				return _react2.default.createElement('img', _extends({}, node.attrs, { key: index }));
			case 'hard_break':
				return _react2.default.createElement('br', { key: index });
			case 'emoji':
				return node.attrs.content;
			case 'text':
				var marks = node.marks || [];
				return marks.reduce(function (previous, current) {
					switch (current.type) {
						case 'strong':
							return _react2.default.createElement(
								'strong',
								{ key: index },
								previous
							);
						case 'em':
							return _react2.default.createElement(
								'em',
								{ key: index },
								previous
							);
						case 'code':
							return _react2.default.createElement(
								'code',
								{ key: index },
								previous
							);
						case 'sub':
							return _react2.default.createElement(
								'sub',
								{ key: index },
								previous
							);
						case 'sup':
							return _react2.default.createElement(
								'sup',
								{ key: index },
								previous
							);
						case 's':
						case 'strike':
							return _react2.default.createElement(
								's',
								{ key: index },
								previous
							);
						case 'link':
							return _react2.default.createElement(
								'a',
								{ href: current.attrs.href, title: current.attrs.title, key: index, target: '_top' },
								previous
							);
						default:
							return previous;
					}
				}, node.text);

			case 'table':
				return _react2.default.createElement(
					'table',
					{ key: index },
					_react2.default.createElement(
						'tbody',
						null,
						renderSubLoop(node.content, meta)
					)
				);
			case 'table_row':
				return _react2.default.createElement(
					'tr',
					null,
					renderSubLoop(node.content, meta)
				);
			case 'table_cell':
				return _react2.default.createElement(
					'td',
					null,
					renderSubLoop(node.content, meta)
				);
			case 'embed':
				var filename = node.attrs.filename;
				var url = meta.fileMap[filename];
				return _react2.default.createElement(
					_renderComponents.EmbedRender,
					_extends({ key: index }, node.attrs, { url: url }),
					renderSubLoop(node.content, meta)
				);
			case 'caption':
				return _react2.default.createElement(
					'div',
					{ key: index, className: 'pub-caption' },
					renderSubLoop(node.content, meta)
				);
			case 'article':
				return _react2.default.createElement(
					'div',
					{ key: index, className: 'pub-article' },
					renderSubLoop(node.content, meta)
				);
			case 'aside':
				return _react2.default.createElement('span', { key: index });
			case 'equation':
				var equationText = void 0;
				if (node.content && node.content.length >= 1) {
					equationText = node.content[0].text;
				} else if (node.attrs.content) {
					equationText = node.attrs.content;
				}
				return _react2.default.createElement(_renderComponents.LatexRender, { key: index, value: equationText, block: false });
			case 'block_equation':
				var blockEquationText = void 0;
				if (node.content && node.content.length >= 1) {
					blockEquationText = node.content[0].text;
				} else if (node.attrs.content) {
					blockEquationText = node.attrs.content;
				}return _react2.default.createElement(_renderComponents.LatexRender, { key: index, value: blockEquationText, block: true });
			case 'iframe':
				return _react2.default.createElement(_renderComponents.IframeRender, _extends({ key: index }, node.attrs));
			case 'mention':
				return _react2.default.createElement(
					_renderComponents.MentionRender,
					_extends({ key: index }, node.attrs),
					renderSubLoop(node.content, meta)
				);

			case 'reference':
				var citationID = node.attrs.citationID;
				var label = meta.engine.getShortForm(citationID);
				/*
    let label;
    if (meta && meta.inlineBib) {
    	label = meta.inlineBib[citationID];
    } else {
    	label = null;
    }
    */
				return _react2.default.createElement(_renderComponents.ReferenceRender, _extends({ key: index, label: label }, node.attrs));
			case 'citations':
				var bib = void 0;

				if (allReferences && allReferences.length > 0) {
					bib = meta.engine.getBibliography();
				} else if (doc && doc.attrs.meta && doc.attrs.meta.bib) {
					bib = meta.bib;
				}
				return _react2.default.createElement(_renderComponents.CitationsRender, _extends({ key: index, renderedBib: bib }, node.attrs, { citations: node.content }));
			default:
				console.log('Error with ', node);
		}
	});

	return content;
};