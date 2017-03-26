'use strict';

var _plugins = require('../plugins');

var _baseEditor = require('./baseEditor');

var _setup = require('../setup');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RichEditor = function (_BaseEditor) {
  _inherits(RichEditor, _BaseEditor);

  function RichEditor(_ref) {
    var place = _ref.place,
        text = _ref.text,
        contents = _ref.contents,
        _ref$components = _ref.components;
    _ref$components = _ref$components === undefined ? {} : _ref$components;
    var suggestComponent = _ref$components.suggestComponent,
        _ref$handlers = _ref.handlers;
    _ref$handlers = _ref$handlers === undefined ? {} : _ref$handlers;
    var createFile = _ref$handlers.createFile,
        onChange = _ref$handlers.onChange,
        captureError = _ref$handlers.captureError;

    _classCallCheck(this, RichEditor);

    var _this = _possibleConstructorReturn(this, (RichEditor.__proto__ || Object.getPrototypeOf(RichEditor)).call(this));

    var _require = require('../setup'),
        pubpubSetup = _require.pubpubSetup;

    var _require2 = require("../markdown"),
        markdownParser = _require2.markdownParser;

    var plugins = pubpubSetup({ schema: _setup.schema }).concat(_plugins.CitationsPlugin).concat(_plugins.SelectPlugin).concat(_plugins.RelativeFilesPlugin);
    var docJSON = void 0;
    if (text) {
      docJSON = markdownParser.parse(text).toJSON();
    } else {
      docJSON = contents;
    }
    _this.create({ place: place, contents: docJSON, plugins: plugins, components: { suggestComponent: suggestComponent }, handlers: { createFile: createFile, onChange: onChange, captureError: captureError } });
    return _this;
  }

  return RichEditor;
}(_baseEditor.BaseEditor);

exports.RichEditor = RichEditor;