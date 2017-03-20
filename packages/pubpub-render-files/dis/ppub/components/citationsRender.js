'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CitationsRender = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styles = {};

// citations HTML..

var CitationsRender = exports.CitationsRender = _react2.default.createClass({
  displayName: 'CitationsRender',

  propTypes: {
    citations: _react.PropTypes.array
  },
  getInitialState: function getInitialState() {
    return { editing: true };
  },

  setSelected: function setSelected(selected) {
    this.setState({ selected: selected });
  },

  renderDisplay: function renderDisplay() {
    var renderedBib = this.props.renderedBib;

    var hideCitations = !(renderedBib && renderedBib.length > 0);

    return _react2.default.createElement(
      'div',
      null,
      !hideCitations ? _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          'h3',
          null,
          'Citations: '
        ),
        renderedBib.map(function (bibItem, index) {
          return _react2.default.createElement('div', { key: index, dangerouslySetInnerHTML: { __html: bibItem.text } });
        })
      ) : null
    );
  },


  render: function render() {
    var editing = this.state.editing;

    return this.renderDisplay();
  }
});

styles = {
  wrapper: {
    backgroundColor: 'blue'
  },
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

exports.default = CitationsRender;