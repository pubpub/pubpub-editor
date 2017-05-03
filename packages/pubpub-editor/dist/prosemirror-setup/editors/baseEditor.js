'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _richNodes = require('../rich-nodes');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _plugins = require('../plugins');

var _schema = require('../schema');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BaseEditor = function () {
	function BaseEditor() {
		var _this = this;

		_classCallCheck(this, BaseEditor);

		this.changeNode = function (currentFrom, nodeType, nodeAttrs) {
			var state = _this.pm;
			var transform = state.tr.setNodeType(currentFrom, nodeType, nodeAttrs);
			var action = transform.action();
			_this.applyAction(action);
		};

		this.getState = function () {
			return _this.view.state;
		};

		this.applyAction = function (action) {
			var newState = _this.view.state.apply(action);
			_this.view.updateState(newState);
		};

		this.toJSON = function () {
			return _this.view.state.doc.toJSON().doc;
		};

		this.toMarkdown = function () {
			var _require = require('../../markdown'),
			    markdownSerializer = _require.markdownSerializer;

			var doc = _this.view.state.doc;
			console.log('Doc', doc.attrs);
			var markdown = markdownSerializer.serialize(_this.view.state.doc, { meta: doc.attrs.meta });
			return markdown;
		};

		this.setDoc = function (newJSONDoc) {
			var _require2 = require('prosemirror-state'),
			    EditorState = _require2.EditorState;

			var newState = EditorState.create({
				doc: _schema.schema.nodeFromJSON(newJSONDoc),
				plugins: _this.plugins
			});
			_this.view.updateState(newState);
			_this.view.update(_this.view.props);
		};

		this.renderMenu = function () {
			_this.menuComponent.rerender();
		};

		this.showError = function (message) {
			_this.menuComponent.showError(message);
		};

		this._onAction = this._onAction.bind(this);
		this.reconfigure = this.reconfigure.bind(this);
	}

	_createClass(BaseEditor, [{
		key: 'create',
		value: function create(_ref) {
			var place = _ref.place,
			    contents = _ref.contents,
			    plugins = _ref.plugins,
			    props = _ref.props,
			    config = _ref.config,
			    _ref$components = _ref.components;
			_ref$components = _ref$components === undefined ? {} : _ref$components;
			var suggestComponent = _ref$components.suggestComponent,
			    _ref$handlers = _ref.handlers,
			    createFile = _ref$handlers.createFile,
			    onChange = _ref$handlers.onChange,
			    captureError = _ref$handlers.captureError,
			    updateMentions = _ref$handlers.updateMentions;

			var _require3 = require('../clipboard'),
			    clipboardParser = _require3.clipboardParser,
			    clipboardSerializer = _require3.clipboardSerializer,
			    transformPastedHTML = _require3.transformPastedHTML;

			var _require4 = require('../../markdown/markdownParser'),
			    markdownParser = _require4.markdownParser;

			var _require5 = require('../menu-config'),
			    buildMenuItems = _require5.buildMenuItems;

			var _require6 = require('prosemirror-state'),
			    EditorState = _require6.EditorState;

			var _require7 = require('prosemirror-view'),
			    EditorView = _require7.EditorView;
			// const collabEditing = require('prosemirror-collab').collab;

			var menu = buildMenuItems(_schema.schema);
			// TO-DO: USE UNIQUE ID FOR USER AND VERSION NUMBER

			this.plugins = plugins;
			this.handlers = { createFile: createFile, onChange: onChange, captureError: captureError };

			var stateConfig = _extends({
				doc: contents ? _schema.schema.nodeFromJSON(contents) : undefined,
				schema: _schema.schema,
				plugins: plugins
			}, config);

			var state = EditorState.create(stateConfig);

			var reactMenu = document.createElement('div');
			var editorView = document.createElement('div');
			editorView.className = 'pub-body';
			// place.appendChild(reactMenu);
			place.appendChild(editorView);

			this.menuElem = reactMenu;

			this.view = new EditorView(editorView, _extends({
				state: state,
				dispatchTransaction: this._onAction,
				spellcheck: true,
				clipboardParser: markdownParser,
				clipboardSerializer: clipboardSerializer,
				// handleContextMenu: (evt, thing, thing2)=> {
				// 	console.log(evt, thing, thing2);
				// },
				transformPastedHTML: transformPastedHTML,
				handleDOMEvents: {
					dragstart: function dragstart(view, evt) {
						evt.preventDefault();
						return true;
					}
				},
				viewHandlers: {
					updateMentions: updateMentions
				},
				nodeViews: {
					embed: function embed(node, view, getPos) {
						return new _richNodes.EmbedView(node, view, getPos, { block: true });
					},
					equation: function equation(node, view, getPos) {
						return new _richNodes.LatexView(node, view, getPos, { block: false });
					},
					block_equation: function block_equation(node, view, getPos) {
						return new _richNodes.LatexView(node, view, getPos, { block: true });
					},
					mention: function mention(node, view, getPos) {
						return new _richNodes.MentionView(node, view, getPos, { block: false, suggestComponent: suggestComponent });
					},
					reference: function reference(node, view, getPos, decorations) {
						return new _richNodes.ReferenceView(node, view, getPos, { decorations: decorations, block: false });
					},
					citations: function citations(node, view, getPos) {
						return new _richNodes.CitationsView(node, view, getPos, { block: false });
					},
					iframe: function iframe(node, view, getPos) {
						return new _richNodes.IframeView(node, view, getPos, {});
					},
					html_block: function html_block(node, view, getPos) {
						return new _richNodes.HtmlView(node, view, getPos, {});
					}
				}
			}, props));
		}
	}, {
		key: 'reconfigure',
		value: function reconfigure(plugins, config) {
			var state = this.view.state;
			var newState = state.reconfigure(_extends({ plugins: plugins }, config));
			this.view.updateState(newState);
		}
	}, {
		key: 'remove',
		value: function remove() {
			this.menuElem.remove();
			if (this.view) {
				this.view.destroy();
			}
		}
	}, {
		key: 'getMentionPos',
		value: function getMentionPos() {
			var mentionsPlugin = void 0;
			if (mentionsPlugin = (0, _plugins.getPlugin)('mentions', this.view.state)) {
				return mentionsPlugin.props.getMentionPos(this.view);
			}
			return null;
		}
	}, {
		key: '_onAction',
		value: function _onAction(transaction) {
			/*
   if (action.transform) {
   	for (const step of action.transform.steps) {
   		// console.log(step);
   		if (step.slice.content.content.length === 0) {
   			console.log('deleted!');
   		const newStep = step.invert(this.view.editor.state.doc);
   		action.transform.step(newStep);
   		}
   	}
   }
   */
			if (!this.view || !this.view.state) {
				return;
			}

			var newState = this.view.state.apply(transaction);
			this.view.updateState(newState);
			if (transaction.docChanged) {
				if (this.view.props.onChange) {
					this.view.props.onChange();
				}
			} else if (this.view.props.onCursor) {
				this.view.props.onCursor();
			}
		}
	}]);

	return BaseEditor;
}();

exports.BaseEditor = BaseEditor;