"use strict";

Object.defineProperty(exports, "__esModule", {
		value: true
});
exports.CitationsComponent = undefined;

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styles = {};

var CitationsComponent = exports.CitationsComponent = _react2.default.createClass({
		displayName: "CitationsComponent",

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

		preventClick: function preventClick(evt) {
				evt.preventDefault();
		},

		deleteClick: function deleteClick(bibItem) {
				this.props.deleteItem(bibItem);
		},

		renderDisplay: function renderDisplay() {
				var citations = this.props.citations;

				var citationData = citations.map(function (citation) {
						return citation.data;
				});
				var citationIDs = citations.map(function (citation) {
						return citation.citationID;
				}).filter(function (citationID) {
						return !!citationID;
				});

				var bib = this.props.getBibliography(citationData, citationIDs);
				// console.log('Got bib!', bib, citations);
				var hideCitations = !(bib && bib.length > 0);
				return _react2.default.createElement(
						"div",
						{ className: "pub-citations", onClick: this.preventClick },
						!hideCitations ? _react2.default.createElement(
								"div",
								null,
								_react2.default.createElement(
										"h3",
										null,
										"Citations: "
								),
								bib.map(function (bibItem) {

										return _react2.default.createElement(
												"div",
												{ className: "pub-citation" },
												_react2.default.createElement("span", { dangerouslySetInnerHTML: { __html: bibItem.text } })
										);
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

exports.default = CitationsComponent;