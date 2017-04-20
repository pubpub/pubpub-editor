"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.CitationsComponent = undefined;

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
		var hideCitations = !(bib && bib.length > 0);
		return _react2.default.createElement(
			"div",
			{ className: "pub-citations", onClick: this.preventClick },
			!hideCitations && _react2.default.createElement(
				"div",
				null,
				_react2.default.createElement(
					"h3",
					null,
					"Citations: "
				),
				bib.map(function (bibItem, index) {
					return _react2.default.createElement(
						"div",
						{ className: "pub-citation", key: "citation-" + index },
						_react2.default.createElement("span", { dangerouslySetInnerHTML: { __html: bibItem.text } })
					);
				})
			)
		);
	},


	render: function render() {
		var editing = this.state.editing;

		return this.renderDisplay();
	}
});

exports.default = CitationsComponent;