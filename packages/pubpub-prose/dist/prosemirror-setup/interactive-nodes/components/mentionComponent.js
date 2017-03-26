'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MentionComponent = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactAutosuggest = require('react-autosuggest');

var _reactAutosuggest2 = _interopRequireDefault(_reactAutosuggest);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styles = {};

var MentionComponent = exports.MentionComponent = _react2.default.createClass({
  displayName: 'MentionComponent',

  propTypes: {
    text: _react.PropTypes.string,
    type: _react.PropTypes.string,
    meta: _react.PropTypes.object,
    revertToText: _react.PropTypes.func,
    updateMention: _react.PropTypes.func,
    suggestComponent: _react.PropTypes.any
  },
  getInitialState: function getInitialState() {
    return { editing: false };
  },
  getDefaultProps: function getDefaultProps() {},

  componentDidMount: function componentDidMount() {},

  openEdit: function openEdit() {
    var _this = this;

    this.setState({ editing: true });
    setTimeout(function () {
      return _this.focus();
    }, 0);
  },

  setSelected: function setSelected(selected) {
    // this.refs.input.focus();
    // this.setState({selected});
  },

  componentWillUnmount: function componentWillUnmount() {},

  handleKeyPress: function handleKeyPress(e) {
    if (e.key === 'Enter' && !this.props.block) {
      var text = this.state.text;
      // this.refs.input.blur();

      this.props.updateMention(text);
      this.changeToNormal();
    }
  },

  handleChange: function handleChange(event, _ref) {
    var newValue = _ref.newValue;

    var value = newValue;
    if (value.length === 0) {
      this.props.revertToText();
      return;
    }
    this.setState({ text: newValue, type: 'file', meta: {} });
    // this.props.updateMention({text: value, type: 'file', meta: {}});
  },

  changeToEditing: function changeToEditing() {
    var _this2 = this;

    var _props = this.props,
        text = _props.text,
        type = _props.type,
        meta = _props.meta;

    this.setState({ editing: true, text: text, type: type, meta: meta });
    setTimeout(function () {
      return _this2.focus();
    }, 0);
  },

  changeToNormal: function changeToNormal() {
    this.setState({ editing: false });
  },

  focus: function focus() {
    if (this.refs.suggest && this.refs.suggest.focus) {
      this.refs.suggest.focus();
    }
  },

  updateMention: function updateMention(text) {
    this.props.updateMention(text);
    this.changeToNormal();
  },

  renderDisplay: function renderDisplay() {
    var text = this.props.text;

    return _react2.default.createElement(
      'span',
      { className: 'mention', onDoubleClick: this.changeToEditing, style: styles.display },
      '@',
      text
    );
  },
  renderEdit: function renderEdit() {
    var SuggestComponent = this.props.suggestComponent ? this.props.suggestComponent.component : null;

    return _react2.default.createElement(
      'span',
      { style: { position: 'relative' } },
      '@',
      SuggestComponent ? _react2.default.createElement(SuggestComponent, _extends({ ref: 'suggest', onCancel: this.props.revertToText, onSelected: this.updateMention }, this.props.suggestComponent.props)) : null
    );
  },


  render: function render() {
    var editing = this.state.editing;

    if (editing) {
      return this.renderEdit();
    }
    return this.renderDisplay();
  }
});

exports.default = MentionComponent;