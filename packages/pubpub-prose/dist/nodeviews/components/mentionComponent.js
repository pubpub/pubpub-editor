'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MentionComponent = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styles = {};

var MentionComponent = exports.MentionComponent = _react2.default.createClass({
  displayName: 'MentionComponent',

  propTypes: {
    value: _react.PropTypes.string,
    block: _react.PropTypes.bool,
    updateValue: _react.PropTypes.func,
    changeToBlock: _react.PropTypes.func,
    changeToInline: _react.PropTypes.func
  },
  getInitialState: function getInitialState() {
    return { editing: true };
  },
  getDefaultProps: function getDefaultProps() {
    return {
      context: 'document'
    };
  },

  componentDidMount: function componentDidMount() {
    var _this = this;

    setTimeout(function () {
      return _this.refs.input.focus();
    }, 0);
  },

  /*
  componentWillReceiveProps: function(nextProps) {
    if (this.props.value !== nextProps.value) {
      const text = nextProps.value;
      // Search for new plugins
    }
  },
  */

  setSelected: function setSelected(selected) {
    console.log('update selected!', selected);
    this.setState({ selected: selected });
  },

  componentWillUnmount: function componentWillUnmount() {
    console.log('unmounted atom!');
  },

  handleKeyPress: function handleKeyPress(e) {
    if (e.key === 'Enter' && !this.props.block) {
      this.changeToNormal();
    }
  },

  handleChange: function handleChange(event) {
    var value = event.target.value;
    this.props.updateValue(value);
  },

  changeToEditing: function changeToEditing() {
    var _this2 = this;

    this.setState({ editing: true });
    setTimeout(function () {
      return _this2.refs.input.focus();
    }, 0);
  },

  changeToNormal: function changeToNormal() {
    this.setState({ editing: false });
  },

  renderDisplay: function renderDisplay() {
    var displayHTML = this.state.displayHTML;
    var _props = this.props,
        value = _props.value,
        block = _props.block;

    return _react2.default.createElement(
      'span',
      { className: 'mention', onDoubleClick: this.changeToEditing, style: styles.display },
      '@',
      value
    );
  },
  renderEdit: function renderEdit() {
    var clientWidth = this.state.clientWidth;
    var _props2 = this.props,
        value = _props2.value,
        block = _props2.block;

    return _react2.default.createElement(
      'span',
      { style: { position: 'relative' } },
      '@',
      _react2.default.createElement('input', {
        id: 'test',
        ref: 'input',
        style: styles.editing({ clientWidth: clientWidth }),
        onDoubleClick: this.changeToNormal,
        onChange: this.handleChange,
        onKeyPress: this.handleKeyPress,
        type: 'text', name: 'name',
        value: value })
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

styles = {
  wrapper: {
    backgroundColor: 'blue'
  },
  display: {},
  editing: function editing(_ref) {
    var clientWidth = _ref.clientWidth;

    return {
      display: 'inline',
      minWidth: '100px',
      fontSize: '12px',
      margin: '0px',
      padding: '0px',
      lineHeight: '1em',
      border: '2px solid #BBBDC0',
      borderRadius: '2px'
    };
  }
};

exports.default = MentionComponent;