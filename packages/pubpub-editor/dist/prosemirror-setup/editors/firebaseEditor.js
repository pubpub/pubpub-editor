'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _plugins = require('../plugins');

var _baseEditor = require('./baseEditor');

var _firebasePlugin = require('../plugins/firebasePlugin');

var _firebasePlugin2 = _interopRequireDefault(_firebasePlugin);

var _firebase = require('firebase');

var _firebase2 = _interopRequireDefault(_firebase);

var _schema = require('../schema');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('prosemirror-collab'),
    collab = _require.collab;

var FirebaseCollabEditor = function (_BaseEditor) {
  _inherits(FirebaseCollabEditor, _BaseEditor);

  function FirebaseCollabEditor(_ref) {
    var place = _ref.place,
        text = _ref.text,
        config = _ref.config,
        contents = _ref.contents,
        props = _ref.props,
        _ref$components = _ref.components;
    _ref$components = _ref$components === undefined ? {} : _ref$components;
    var suggestComponent = _ref$components.suggestComponent,
        _ref$handlers = _ref.handlers;
    _ref$handlers = _ref$handlers === undefined ? {} : _ref$handlers;
    var createFile = _ref$handlers.createFile,
        onChange = _ref$handlers.onChange,
        captureError = _ref$handlers.captureError,
        updateMentions = _ref$handlers.updateMentions;

    _classCallCheck(this, FirebaseCollabEditor);

    var _this = _possibleConstructorReturn(this, (FirebaseCollabEditor.__proto__ || Object.getPrototypeOf(FirebaseCollabEditor)).call(this));

    var _require2 = require('../setup'),
        pubpubSetup = _require2.pubpubSetup;

    var _require3 = require("../../markdown"),
        markdownParser = _require3.markdownParser;

    var collabEditing = require('prosemirror-collab').collab;

    var clientID = String(Math.round(Math.random() * 100000));

    var plugins = pubpubSetup({ schema: _schema.schema }).concat(_plugins.CitationsPlugin).concat(_plugins.SelectPlugin).concat(_plugins.RelativeFilesPlugin).concat(_plugins.MentionsPlugin).concat(_plugins.FootnotesPlugin).concat((0, _firebasePlugin2.default)({ selfClientID: clientID })).concat(collab({ clientID: clientID }));

    var docJSON = void 0;
    if (text) {
      docJSON = markdownParser.parse(text).toJSON();
    } else {
      docJSON = contents;
    }
    _this.create({ place: place, contents: docJSON, config: config, props: props, plugins: plugins, components: { suggestComponent: suggestComponent }, handlers: { createFile: createFile, onChange: onChange, captureError: captureError, updateMentions: updateMentions } });

    return _this;
  }

  _createClass(FirebaseCollabEditor, [{
    key: '_onAction',
    value: function _onAction(transaction) {
      if (!this.view || !this.view.state) {
        return;
      }

      var newState = this.view.state.apply(transaction);
      this.view.updateState(newState);
      if (transaction.docChanged) {
        if (this.view.props.onChange) {
          this.view.props.onChange();
        }
      } else if (this.view.props.onCursor) {
        this.view.props.onCursor();
      }

      var firebasePlugin = void 0;
      if (firebasePlugin = (0, _plugins.getPlugin)('firebase', this.view.state)) {
        return firebasePlugin.props.updateCollab(transaction, newState);
      }
    }
  }]);

  return FirebaseCollabEditor;
}(_baseEditor.BaseEditor);

exports.FirebaseEditor = FirebaseCollabEditor;