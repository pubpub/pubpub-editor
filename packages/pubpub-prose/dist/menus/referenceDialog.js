'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ReferenceDialog = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
// import Cite from 'cite/cite.js';


var _core = require('@blueprintjs/core');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _bibtextocsl = require('../plugins/bibtextocsl');

var _bibtextocsl2 = _interopRequireDefault(_bibtextocsl);

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var styles = {};

var TabIndexes = {
	MANUAL: 0,
	BIBTEX: 1,
	URL: 2,
	EXISTING: 3
};

var ReferenceDialog = exports.ReferenceDialog = _react2.default.createClass({
	displayName: 'ReferenceDialog',

	propTypes: {
		value: _react.PropTypes.string
	},
	getInitialState: function getInitialState() {
		return {
			selectedTabIndex: TabIndexes.MANUAL,
			addedFields: ['title', 'author', 'journal', 'year'],
			referenceData: {
				title: '',
				url: '',
				author: '',
				journal: '',
				volume: '',
				number: '',
				pages: '',
				year: '',
				publisher: '',
				doi: '',
				note: ''
			},
			addFieldEnable: false,
			manual: {
				url: '',
				metadata: {}
			},
			savable: false
		};
	},


	inputChange: function inputChange(type, evt) {
		var newReferenceData = _extends({}, this.state.referenceData, _defineProperty({}, type, evt.target.value));

		this.setState({
			referenceData: newReferenceData
		});
	},

	getMetaData: function getMetaData() {
		var _this = this;

		var url = this.refs.manualurl.value;

		_superagent2.default.post('/api/getReferenceFromURL').send({ url: url }).end(function (err, res) {
			var urlMetaData = JSON.parse(res.text);
			console.log(urlMetaData);
			_this.setState({ referenceData: urlMetaData, selectedTabIndex: TabIndexes.MANUAL });
		});
	},

	mapMetaData: function mapMetaData() {},

	handleKeyPress: function handleKeyPress(e) {
		if (e.key === 'Enter') {
			this.getMetaData();
		}
	},

	/*
 	@article{garcia2003genome,
  title={The genome sequence of Yersinia pestis bacteriophage $\varphi$A1122 reveals an intimate history with the coliphage T3 and T7 genomes},
  author={Garcia, Emilio and Elliott, Jeffrey M and Ramanculov, Erlan and Chain, Patrick SG and Chu, May C and Molineux, Ian J},
  journal={Journal of bacteriology},
  volume={185},
  number={17},
  pages={5248--5262},
  year={2003},
  publisher={Am Soc Microbiol}
 }
 */

	generateBibTexString: function generateBibTexString(jsonInfo) {
		var fields = ['title', 'author', 'journal', 'volume', 'number', 'pages', 'year'];
		var map = {
			'journal_title': 'journal',
			'author_instituion': 'institution'
		};
		var jsonKeys = Object.keys(jsonInfo);
		return '\n\t\t\t@article{bibgen,\n\t\t\t\t' + jsonKeys.map(function (key) {
			if (jsonInfo[key]) {
				return key + '={' + jsonInfo[key] + '}';
			}
			return null;
		}).filter(function (value) {
			return !!value;
		}).join(',') + '\n\t\t\t}\n\t\t';
	},
	addField: function addField(field) {
		var newFields = this.state.addedFields;
		newFields.push(field);
		this.setState({ addedFields: newFields });
	},
	onFieldChange: function onFieldChange() {
		this.setState({ addFieldEnable: true });
	},
	saveReference: function saveReference() {
		var selectedTabIndex = this.state.selectedTabIndex;

		var citationData = {};
		var bibTexString = void 0;

		if (selectedTabIndex === TabIndexes.MANUAL) {
			/*
   for (const field of this.state.addedFields) {
   	citationData[field] = this.refs[field].value;
   }
   */
			bibTexString = this.generateBibTexString(this.state.referenceData);
		} else if (selectedTabIndex === TabIndexes.BIBTEX) {
			bibTexString = this.refs.bibtexText.value;
		}

		var cslJSON = (0, _bibtextocsl2.default)(bibTexString);

		if (cslJSON && cslJSON.length > 0 && Object.keys(cslJSON[0]).length > 0) {

			var randomCitationId = !cslJSON.id || isNaN(cslJSON.id) ? Math.round(Math.random() * 100000000) : cslJSON.id;
			cslJSON.id = randomCitationId;
			this.props.saveReference(cslJSON[0]);
		}
	},
	changedTab: function changedTab(selectedTabIndex, prevSelectedTabIndex) {
		this.setState({ selectedTabIndex: selectedTabIndex });
	},


	preventClick: function preventClick(evt) {
		evt.preventDefault();
	},

	render: function render() {
		var _this2 = this;

		var open = this.props.open;


		var allFields = Object.keys(this.state.referenceData);
		var addedFields = this.state.addedFields;
		var notAdded = allFields.filter(function (n) {
			return addedFields.indexOf(n) === -1;
		});

		var manualAddPopover = _react2.default.createElement(
			_core.Menu,
			null,
			notAdded.map(function (key, index) {
				return _react2.default.createElement(_core.MenuItem, { key: key, onClick: _this2.addField.bind(_this2, key), text: key });
			})
		);

		return _react2.default.createElement(
			'div',
			{ onClick: this.preventClick },
			_react2.default.createElement(
				_core.Dialog,
				{
					iconName: 'inbox',
					isOpen: open,
					onClose: this.props.onClose,
					title: 'Add Reference'
				},
				_react2.default.createElement(
					'div',
					{ className: 'pt-dialog-body' },
					_react2.default.createElement(
						_core.Tabs,
						{ onChange: this.changedTab, selectedTabIndex: this.state.selectedTabIndex },
						_react2.default.createElement(
							_core.TabList,
							null,
							_react2.default.createElement(
								_core.Tab,
								{ key: 'manual' },
								'Manual Add'
							),
							_react2.default.createElement(
								_core.Tab,
								{ key: 'bibtex' },
								'Import from BiBTeX'
							)
						),
						_react2.default.createElement(
							_core.TabPanel,
							null,
							addedFields.map(function (key, index) {
								return _react2.default.createElement(
									'div',
									{ key: 'refernceField-' + index },
									_react2.default.createElement(
										'label',
										{ className: 'pt-label', htmlFor: key },
										key
									),
									_react2.default.createElement('input', { style: { width: '80%' }, className: 'pt-input', ref: key, id: key, name: key, type: 'text', value: _this2.state.referenceData[key], onChange: _this2.inputChange.bind(_this2, key) })
								);
							}),
							_react2.default.createElement(
								'div',
								{ className: 'pt-input-group' },
								_react2.default.createElement(
									_core.Popover,
									{ content: manualAddPopover,
										interactionKind: _core.PopoverInteractionKind.CLICK,
										popoverClassName: 'pt-popover-content-sizing pt-minimal editorMenuPopover',
										position: _core.Position.TOP,
										useSmartPositioning: false },
									_react2.default.createElement(
										'button',
										{ style: { marginLeft: 0, marginTop: 10 }, type: 'button', className: 'pt-button' },
										_react2.default.createElement('span', { className: 'pt-icon-standard pt-icon-add-to-artifact' }),
										'Add Field',
										_react2.default.createElement('span', { className: 'pt-icon-standard pt-icon-caret-up pt-align-right' })
									)
								)
							)
						),
						_react2.default.createElement(
							_core.TabPanel,
							null,
							_react2.default.createElement(
								'div',
								{ className: 'pt-callout' },
								'Paste in BiBTeX data and we will automatically create a reference.'
							),
							_react2.default.createElement('textarea', { className: 'pt-input pt-fill', dir: 'auto', ref: 'bibtexText' })
						)
					)
				),
				_react2.default.createElement(
					'div',
					{ className: 'pt-dialog-footer' },
					_react2.default.createElement(
						'div',
						{ className: 'pt-dialog-footer-actions' },
						this.state.selectedTabIndex !== TabIndexes.URL ? _react2.default.createElement(_core.Button, { intent: 'yes', onClick: this.saveReference, text: 'Insert' }) : _react2.default.createElement(_core.Button, { intent: 'yes', onClick: this.getMetaData, text: 'Get Citation' })
					)
				)
			)
		);
	}
});

exports.default = ReferenceDialog;