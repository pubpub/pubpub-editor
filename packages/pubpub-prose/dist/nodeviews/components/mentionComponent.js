'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MentionComponent = undefined;

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
    this.setState({ editing: true });
    // setTimeout(() => this.refs.suggest.input.focus(), 0);
  },

  setSelected: function setSelected(selected) {
    // this.refs.input.focus();
    // this.setState({selected});
  },

  componentWillUnmount: function componentWillUnmount() {},

  handleKeyPress: function handleKeyPress(e) {
    if (e.key === 'Enter' && !this.props.block) {
      var _state = this.state,
          text = _state.text,
          type = _state.type,
          meta = _state.meta;
      // this.refs.input.blur();

      this.props.updateMention({ text: text, type: type, meta: meta });
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
    var _props = this.props,
        text = _props.text,
        type = _props.type,
        meta = _props.meta;

    this.setState({ editing: true, text: text, type: type, meta: meta });
    // setTimeout(() => this.refs.input.focus(), 0);
  },

  changeToNormal: function changeToNormal() {
    this.setState({ editing: false });
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
      SuggestComponent ? _react2.default.createElement(SuggestComponent, this.props.suggestComponent.props) : null
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