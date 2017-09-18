'use strict';

Object.defineProperty(exports, "__esModule", {
		value: true
});
exports.IframeComponent = undefined;

var _block;

var _core = require('@blueprintjs/core');

var _radium = require('radium');

var _radium2 = _interopRequireDefault(_radium);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var styles = {};

var IframeComponent = exports.IframeComponent = _react2.default.createClass({
		displayName: 'IframeComponent',

		propTypes: {
				url: _react.PropTypes.string,
				width: _react.PropTypes.string,
				height: _react.PropTypes.string
		},
		getInitialState: function getInitialState() {
				return {
						editing: false
				};
		},
		getDefaultProps: function getDefaultProps() {
				return {
						context: 'document'
				};
		},

		changeToEditing: function changeToEditing() {
				var _this = this;

				var clientWidth = _reactDom2.default.findDOMNode(this.refs.latexElem).getBoundingClientRect().width;
				this.setState({ editing: true, clientWidth: clientWidth });
				setTimeout(function () {
						return _this.refs.input.focus();
				}, 10);
		},

		changeToNormal: function changeToNormal() {
				var displayHTML = this.generateHTML(this.props.value);
				this.setState({ editing: false, displayHTML: displayHTML });
		},

		handleChange: function handleChange(event) {
				var value = event.target.value;
				// this.setState({value});
				this.props.updateValue(value);
		},

		handleKeyPress: function handleKeyPress(e) {
				if (e.key === 'Enter' && !this.props.block) {
						this.changeToNormal();
				}
		},

		setSelected: function setSelected(selected) {
				this.setState({ selected: selected });
		},

		renderDisplay: function renderDisplay() {
				var _state = this.state,
				    displayHTML = _state.displayHTML,
				    selected = _state.selected,
				    closePopOver = _state.closePopOver;
				var _props = this.props,
				    value = _props.value,
				    block = _props.block;


				var popoverContent = _react2.default.createElement(
						'div',
						{ className: 'pt-button-group pt-fill' },
						_react2.default.createElement(
								_core.Button,
								{ iconName: 'annotation', onClick: this.changeToEditing },
								'Edit'
						),
						!block ? _react2.default.createElement(
								_core.Button,
								{ iconName: 'maximize', onClick: this.changeToBlock },
								'Block'
						) : _react2.default.createElement(
								_core.Button,
								{ iconName: 'minimize', onClick: this.changeToInline },
								'Inline'
						)
				);

				var isPopOverOpen = closePopOver ? false : undefined;

				return _react2.default.createElement(
						'span',
						{ style: styles.display({ block: block, selected: selected }) },
						_react2.default.createElement(_radium.Style, { rules: katexStyles }),
						_react2.default.createElement(
								_core.Popover,
								{ content: popoverContent,
										isOpen: isPopOverOpen,
										interactionKind: _core.PopoverInteractionKind.CLICK,
										popoverClassName: 'pt-popover-content-sizing',
										position: _core.Position.BOTTOM,
										useSmartPositioning: false },
								block ? _react2.default.createElement('div', {
										ref: 'latexElem',
										className: 'pub-embed-latex',
										dangerouslySetInnerHTML: { __html: displayHTML },
										style: styles.output }) : _react2.default.createElement('span', {
										ref: 'latexElem',
										className: 'pub-embed-latex',
										dangerouslySetInnerHTML: { __html: displayHTML },
										style: styles.output })
						)
				);
		},
		renderEdit: function renderEdit() {
				var clientWidth = this.state.clientWidth;
				var _props2 = this.props,
				    value = _props2.value,
				    block = _props2.block;


				var popoverContent = _react2.default.createElement(
						'div',
						null,
						_react2.default.createElement(
								_core.Button,
								{ iconName: 'annotation', onClick: this.changeToNormal },
								'Save'
						)
				);

				return _react2.default.createElement(
						'span',
						{ style: { position: 'relative' } },
						block ? _react2.default.createElement(
								_core.Popover,
								{ content: popoverContent,
										defaultIsOpen: true,
										interactionKind: _core.PopoverInteractionKind.CLICK,
										popoverClassName: 'pt-popover-content-sizing',
										position: _core.Position.BOTTOM,
										autoFocus: false,
										enforceFocus: false,
										useSmartPositioning: false },
								_react2.default.createElement(
										'div',
										{ className: 'pt-input-group' },
										_react2.default.createElement('span', { className: 'pt-icon pt-icon-function' }),
										_react2.default.createElement('textarea', {
												ref: 'input',
												type: 'text',
												className: 'pt-input',
												placeholder: 'Enter equation...',
												onChange: this.handleChange,
												value: value })
								)
						) : _react2.default.createElement(
								'div',
								{ className: 'pt-input-group' },
								_react2.default.createElement('span', { className: 'pt-icon pt-icon-function' }),
								_react2.default.createElement('input', {
										ref: 'input',
										type: 'text',
										className: 'pt-input',
										placeholder: 'Enter equation...',
										onChange: this.handleChange,
										onKeyPress: this.handleKeyPress,
										value: value })
						)
				);
		},


		render: function render() {
				var editing = this.state.editing;

				return _react2.default.createElement(
						'div',
						null,
						'Editing iframes not supported yet.'
				);
		}
});

styles = {
		wrapper: {
				backgroundColor: 'blue'
		},
		block: (_block = {
				position: 'absolute',
				left: '0px',
				fontSize: '15px',
				border: '1px solid black',
				borderRadius: '1px',
				width: '100px',
				height: '25px',
				lineHeight: '25px'
		}, _defineProperty(_block, 'width', 'auto'), _defineProperty(_block, 'padding', '3px 6px'), _defineProperty(_block, 'marginTop', '5px'), _defineProperty(_block, 'cursor', 'pointer'), _block),
		display: function display(_ref) {
				var block = _ref.block,
				    selected = _ref.selected;

				return {
						outline: selected ? '2px solid #BBBDC0' : '2px solid transparent',
						fontSize: block ? '20px' : '0.9em'
				};
		},
		editing: function editing(_ref2) {
				var clientWidth = _ref2.clientWidth;

				return {
						display: 'inline',
						width: Math.round(clientWidth),
						minWidth: '100px',
						fontSize: '1em',
						margin: '0px',
						padding: '0px',
						lineHeight: '1em',
						border: 'none',
						outline: '2px solid #BBBDC0',
						borderRadius: 'none'
				};
		}
};

exports.default = IframeComponent;