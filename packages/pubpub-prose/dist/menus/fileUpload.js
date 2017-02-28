'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.FileUploadDialog = undefined;

var _core = require('@blueprintjs/core');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDropzone = require('react-dropzone');

var _reactDropzone2 = _interopRequireDefault(_reactDropzone);

var _radium = require('radium');

var _radium2 = _interopRequireDefault(_radium);

var _renderFiles = require('@pubpub/render-files');

var _uploadFile = require('./uploadFile');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import {globalStyles} from 'utils/styleConstants';


var styles = void 0;

var FileUploadDialog = exports.FileUploadDialog = _react2.default.createClass({
	displayName: 'FileUploadDialog',

	propTypes: {},

	getInitialState: function getInitialState() {
		return {
			uploadRates: [],
			uploadFiles: [],
			selectedTabIndex: 0
		};
	},


	// On file drop (or on file select)
	// Upload files automatically to s3
	// On completion call function that hits the pubpub server to generate asset information
	// Generated asset information is then sent to Firebase for syncing with other users
	onDrop: function onDrop(files) {
		var _this = this;

		var startingFileIndex = this.state.uploadRates.length;
		var newUploadRates = files.map(function (file) {
			return 0;
		});
		var newUploadFiles = files.map(function (file) {
			return file.name;
		});
		var uploadRates = this.state.uploadRates.concat(newUploadRates);
		var uploadFiles = this.state.uploadFiles.concat(newUploadFiles);

		files.map(function (file, index) {
			(0, _uploadFile.s3Upload)(file, _this.onFileProgress, _this.onFileFinish, startingFileIndex + index);
		});

		this.setState({
			uploadRates: uploadRates,
			uploadFiles: uploadFiles
		});
	},

	// Update state's progress value when new events received.
	onFileProgress: function onFileProgress(evt, index) {
		var percentage = evt.loaded / evt.total;
		var tempUploadRates = this.state.uploadRates;
		tempUploadRates[index] = percentage;
		this.setState({ uploadRates: tempUploadRates });
	},

	onFileFinish: function onFileFinish(evt, index, type, filename, title) {

		var fileURL = 'https://assets.pubpub.org/' + filename;
		var realFileName = filename.split('/').pop();
		var fileType = (0, _renderFiles.URLToType)(fileURL);
		this.props.uploadFile({ url: fileURL, filename: title, preview: true, type: fileType });
	},

	setFilter: function setFilter(string) {
		this.setState({ filter: string });
	},

	changedTab: function changedTab(selectedTabIndex, prevSelectedTabIndex) {
		this.setState({ selectedTabIndex: selectedTabIndex });
	},
	selectFile: function selectFile(filename, url) {
		this.setState({ selectedURL: url });
		this.props.insertFile({ url: url, filename: filename, preview: false });
	},
	renderExistingFiles: function renderExistingFiles(files) {
		var _this2 = this;

		return Object.keys(files).map(function (filename) {
			var fileurl = files[filename];
			if (!fileurl) {
				return null;
			}
			var type = (0, _renderFiles.URLToType)(fileurl);
			if (!type || type.indexOf('image') === -1) {
				return null;
			}
			var selected = _this2.state.selectedURL === fileurl;
			return _react2.default.createElement(
				'div',
				{ key: filename, onClick: _this2.selectFile.bind(_this2, filename, fileurl), style: styles.card({ selected: selected }), className: 'pt-card pt-elevation-0 pt-interactive' },
				_react2.default.createElement(
					'h5',
					{ style: styles.label },
					_react2.default.createElement(
						'a',
						{ href: '#' },
						filename
					)
				),
				_react2.default.createElement('img', { src: 'https://jake.pubpub.org/unsafe/50x50/' + fileurl })
			);
		});
	},


	preventClick: function preventClick(evt) {
		evt.preventDefault();
	},

	render: function render() {

		var uploading = this.state.uploadRates.length > 0;
		var uploadRate = uploading ? this.state.uploadRates[0] : 0;

		return _react2.default.createElement(
			'div',
			{ onClick: this.preventClick },
			_react2.default.createElement(
				_core.Tabs,
				{ onChange: this.changedTab, selectedTabIndex: this.state.selectedTabIndex },
				_react2.default.createElement(
					_core.TabList,
					null,
					_react2.default.createElement(
						_core.Tab,
						{ key: 'manual' },
						'Upload'
					),
					_react2.default.createElement(
						_core.Tab,
						{ key: 'bibtex' },
						'Import from Existing'
					)
				),
				_react2.default.createElement(
					_core.TabPanel,
					null,
					_react2.default.createElement(
						_reactDropzone2.default,
						{ ref: 'dropzone', disableClick: false, onDrop: this.onDrop, style: {}, activeClassName: 'dropzone-active' },
						!uploading ? _react2.default.createElement(_core.NonIdealState, {
							title: 'Upload a File',
							description: 'Click or Drag files to add',
							visual: 'folder-open',
							action: null
						}) : _react2.default.createElement(_core.Spinner, {
							value: uploadRate
						})
					)
				),
				_react2.default.createElement(
					_core.TabPanel,
					null,
					_react2.default.createElement(
						'div',
						{ style: styles.cardContainer },
						this.renderExistingFiles(this.props.files)
					)
				)
			)
		);
	}

});

exports.default = FileUploadDialog;


styles = {
	label: {
		overflow: 'hidden',
		textOverflow: 'ellipsis'
	},
	cardContainer: {
		backgroundColor: 'white',
		height: '40vh',
		overflowY: 'scroll'
	},
	card: function card(_ref) {
		var selected = _ref.selected;

		return {
			width: '45%',
			display: 'inline-block',
			margin: '5px',
			backgroundColor: selected ? 'rgb(249, 248, 248)' : 'white'
		};
	}
};