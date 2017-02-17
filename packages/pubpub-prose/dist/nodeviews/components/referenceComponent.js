'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ReferenceComponent = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styles = {};

var ReferenceComponent = exports.ReferenceComponent = _react2.default.createClass({
  displayName: 'ReferenceComponent',

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

  // what happens if you click or hover a reference?\
  //  could: emit an action that hovers the info
  //  could: pass in info stored in a citation database
  //  could: use node decorations to put info on them without storing it permanently
  //      -> Ideal


  /*
  componentWillReceiveProps: function(nextProps) {
    if (this.props.value !== nextProps.value) {
      const text = nextProps.value;
      // Search for new plugins
    }
  },
  */

  setSelected: function setSelected(selected) {
    this.setState({ selected: selected });
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
    var _this = this;

    this.setState({ editing: true });
    setTimeout(function () {
      return _this.refs.input.focus();
    }, 0);
  },

  changeToNormal: function changeToNormal() {
    this.setState({ editing: false });
  },

  updateLabel: function updateLabel(label) {
    this.setState({ label: label });
  },

  renderDisplay: function renderDisplay() {

    var referenceClass = (0, _classnames2.default)({
      'reference': true,
      'selected': this.state.selected
    });

    return _react2.default.createElement(
      'span',
      { className: referenceClass },
      this.state.label ? this.state.label : "[1]"
    );
  },


  render: function render() {
    return this.renderDisplay();
  }
});

styles = {
  wrapper: {
    backgroundColor: 'blue'
  },
  selected: {},
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

exports.default = ReferenceComponent;