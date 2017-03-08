'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.BaseMenu = undefined;

var _core = require('@blueprintjs/core');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _plugins = require('../plugins');

var _basePrompt = require('./basePrompt');

var _basePrompt2 = _interopRequireDefault(_basePrompt);

var _fileDialog = require('./fileDialog');

var _fileDialog2 = _interopRequireDefault(_fileDialog);

var _referenceDialog = require('./referenceDialog');

var _referenceDialog2 = _interopRequireDefault(_referenceDialog);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styles = {};

var BaseMenu = exports.BaseMenu = _react2.default.createClass({
	displayName: 'BaseMenu',

	propTypes: {
		onClose: _react.PropTypes.func
	},
	getInitialState: function getInitialState() {
		return {};
	},

	buildMenu: function buildMenu(menu, filter) {
		var _this = this;

		var loopFunc = function loopFunc(menuItem) {
			if (Array.isArray(menuItem)) {
				return _this.buildMenu(menuItem, true);
			} else if (menuItem.content && menuItem.content.length > 0) {
				var items = _this.buildMenu(menuItem.content, true);
				if (items.length === 0) {
					return false;
				}
			} else if (menuItem.spec) {
				var spec = menuItem.spec;
				if (spec.select && !spec.select(_this.props.view.state)) {
					return false;
				}
			}
			return true;
		};

		return filter ? menu.filter(loopFunc) : menu.map(loopFunc);
	},

	showError: function showError(message) {
		this.refs.errorToast.show({ message: message, intent: _core.Intent.DANGER });
	},

	renderMenu: function renderMenu(menu) {
		var _this2 = this;

		var inDropdown = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

		var editorState = this.props.view.state;

		var menuItems = menu.map(function (menuItem) {
			if (Array.isArray(menuItem)) {
				var m = _this2.renderMenu(menuItem);
				m.concat(_react2.default.createElement('div', { className: 'editorMenuSeperator' }));
				return m;
			} else if (menuItem.content && menuItem.content.length > 0) {
				var renderedSubMenu = _this2.renderMenu(menuItem.content, true);
				renderedSubMenu = renderedSubMenu.filter(function (subItem) {
					return subItem && !subItem.props.disabled;
				});
				if (menuItem.options.hideOnDisable === true && renderedSubMenu.length === 0) {
					return null;
				}
				var popoverContent = _react2.default.createElement(
					_core.Menu,
					null,
					_this2.renderMenu(menuItem.content, true)
				);
				var findActiveItems = function findActiveItems(menuItems) {
					var _iteratorNormalCompletion = true;
					var _didIteratorError = false;
					var _iteratorError = undefined;

					try {
						for (var _iterator = menuItems[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
							var subMenu = _step.value;

							if (subMenu.spec && subMenu.spec.active) {
								var active = subMenu.spec.active(editorState);
								if (active) {
									return subMenu;
								}
							}
						}
					} catch (err) {
						_didIteratorError = true;
						_iteratorError = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion && _iterator.return) {
								_iterator.return();
							}
						} finally {
							if (_didIteratorError) {
								throw _iteratorError;
							}
						}
					}

					return null;
				};
				var activeItem = findActiveItems(menuItem.content);
				var label = activeItem ? activeItem.spec.label : menuItem.options.label;
				var className = menuItem.options.className ? menuItem.options.className : '';
				var icon = menuItem.options.icon ? menuItem.options.icon : null;
				return _react2.default.createElement(
					_core.Popover,
					{ key: label, content: popoverContent,
						interactionKind: _core.PopoverInteractionKind.CLICK,
						popoverClassName: 'pt-popover-content-sizing pt-minimal editorMenuPopover',
						className: '' + className,
						position: _core.Position.BOTTOM_LEFT,
						useSmartPositioning: false },
					_react2.default.createElement(
						'a',
						{ className: 'pt-button pt-icon-' + icon, tabIndex: '0', role: 'button' },
						label,
						' ',
						_react2.default.createElement('span', { className: 'pt-icon-standard pt-icon-caret-down pt-align-right' })
					)
				);
			} else {
				var run = _this2.runSpec.bind(_this2, menuItem.spec);
				var title = menuItem.spec.title;
				var text = !menuItem.spec.icon || inDropdown ? menuItem.spec.title : null;
				var _icon = menuItem.spec.icon ? menuItem.spec.icon : null;
				var active = menuItem.spec.select ? menuItem.spec.select(editorState) : true;
				if (!active && menuItem.spec.hideOnDisable === true) {
					return null;
				}
				if (inDropdown) {
					var level = menuItem.spec.attrs && menuItem.spec.attrs ? menuItem.spec.attrs.level : 0;
					var levels = {
						1: 2.3,
						2: 2,
						3: 1.7,
						4: 1.3
					};
					var buttonStyle = {
						fontSize: levels[level] + 'em',
						lineHeight: levels[level] + 'em'
					};
					return _react2.default.createElement(
						'div',
						{ disabled: !active, style: buttonStyle },
						_react2.default.createElement(_core.MenuItem, { disabled: !active, iconName: _icon, onClick: run, text: text }),
						' '
					);
				} else {
					var _buttonStyle = {};
					if (!text) {
						_buttonStyle.maxWidth = 50;
						_buttonStyle.width = 40;
					}
					return _react2.default.createElement(
						_core.Button,
						{ disabled: !active, style: _buttonStyle, iconName: _icon, onClick: run },
						text
					);
				}
			}
		});
		return menuItems;
	},

	insertFile: function insertFile(_ref) {
		var url = _ref.url,
		    filename = _ref.filename;

		this.state.dialogSpec.run(this.props.view.state, this.props.view.dispatch, this.props.view, { url: url, filename: filename });
		this.setState({ dialogSpec: null, dialogType: null, dialogExtension: null });
	},
	saveFile: function saveFile(_ref2) {
		var url = _ref2.url,
		    filename = _ref2.filename,
		    type = _ref2.type;

		this.state.dialogSpec.run(this.props.view.state, this.props.view.dispatch, this.props.view, { url: url, filename: filename });
		if (this.props.createFile) {
			this.props.createFile({ url: url, filename: filename, type: type });
		}
		this.setState({ dialogSpec: null, dialogType: null, dialogExtension: null });
	},
	saveReference: function saveReference(referenceData) {
		this.state.dialogSpec.run(this.props.view.state, this.props.view.dispatch, this.props.view, referenceData);
		this.setState({ dialogSpec: null, dialogType: null, dialogExtension: null });
	},
	saveLink: function saveLink(linkData) {
		this.state.dialogSpec.run(linkData);
		this.setState({ dialogSpec: null, dialogType: null, dialogExtension: null });
	},
	saveTable: function saveTable(tableData) {
		this.state.dialogSpec.run(this.props.view.state, this.props.view.dispatch, this.props.view, tableData);
		this.setState({ dialogSpec: null, dialogType: null, dialogExtension: null });
	},


	runSpec: function runSpec(spec) {
		var _this3 = this;

		if (spec.dialogType) {
			if (spec.dialogCallback) {
				var openPrompt = function openPrompt(_ref3) {
					var callback = _ref3.callback;

					var newSpec = { run: callback };
					_this3.setState({ dialogSpec: newSpec, dialogType: spec.dialogType, dialogExtension: spec.dialogExtension });
				};
				spec.run(this.props.view.state, this.props.view.dispatch, this.props.view, openPrompt);
			} else {
				this.setState({ dialogSpec: spec, dialogType: spec.dialogType, dialogExtension: spec.dialogExtension });
			}
			return;
		}
		spec.run(this.props.view.state, this.props.view.dispatch, this.props.view);
	},

	showReference: function showReference() {
		this.setState({ dialogType: 'file', dialogExtension: '.jpg .img' });
	},

	onClose: function onClose() {
		this.setState({ dialogSpec: null, dialogType: null, dialogExtension: null });
	},

	getExisting: function getExisting() {
		var citations = (0, _plugins.getPluginState)('citations', this.view.state);
	},

	getFiles: function getFiles() {
		var filesPlugin = (0, _plugins.getPlugin)('relativefiles', this.props.view.state);
		if (filesPlugin && filesPlugin.props) {
			var files = filesPlugin.props.getAllFiles({ state: this.props.view.state });
			return files;
		}
		return {};
	},

	preventClick: function preventClick(evt) {
		evt.preventDefault();
	},

	renderDisplay: function renderDisplay() {
		var renderedMenu = this.buildMenu(this.props.menu);
		var editorState = this.props.view.state;
		return _react2.default.createElement(
			'div',
			{ className: 'editorWrapper', onClick: this.preventClick },
			_react2.default.createElement(_core.Toaster, { position: _core.Position.TOP, ref: 'errorToast' }),
			_react2.default.createElement(
				'div',
				{ className: 'pt-button-group editorMenu' },
				this.renderMenu(this.props.menu)
			),
			this.state.dialogType === 'file' ? _react2.default.createElement(_fileDialog2.default, { files: this.getFiles(), editorState: editorState, onClose: this.onClose, insertFile: this.insertFile, saveFile: this.saveFile, open: true }) : null,
			this.state.dialogType === 'reference' ? _react2.default.createElement(_referenceDialog2.default, { onClose: this.onClose, saveReference: this.saveReference, open: true }) : null,
			this.state.dialogType === 'link' ? _react2.default.createElement(_basePrompt2.default, { type: 'link', onClose: this.onClose, savePrompt: this.saveLink }) : null,
			this.state.dialogType === 'table' ? _react2.default.createElement(_basePrompt2.default, { type: 'table', onClose: this.onClose, savePrompt: this.saveTable }) : null
		);
	},


	rerender: function rerender() {
		this.forceUpdate();
	},

	render: function render() {
		var editing = this.state.editing;

		return this.renderDisplay();
	}
});

exports.default = BaseMenu;