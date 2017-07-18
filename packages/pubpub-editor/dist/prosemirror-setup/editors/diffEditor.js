'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _richEditor = require('./richEditor');

var _plugins = require('../plugins');

var _murmurhash = require('murmurhash');

var _murmurhash2 = _interopRequireDefault(_murmurhash);

var _schema = require('../schema');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// show added in green and removed in reduce
// hovering on one, highlights both changed
// clicking on one, accepts changes into the document


// use state.write in markdown serializer to build a diff map?

var DiffEditor = function (_AbstractEditor) {
  _inherits(DiffEditor, _AbstractEditor);

  function DiffEditor(_ref) {
    var place = _ref.place,
        text = _ref.text,
        contents = _ref.contents;

    _classCallCheck(this, DiffEditor);

    var _this = _possibleConstructorReturn(this, (DiffEditor.__proto__ || Object.getPrototypeOf(DiffEditor)).call(this));

    var _require = require('../pubpubSetup'),
        pubpubSetup = _require.pubpubSetup;

    var _require2 = require("../markdownParser"),
        markdownParser = _require2.markdownParser;

    var plugins = pubpubSetup({ schema: _schema.schema });
    var docJSON = void 0;
    if (text) {
      docJSON = markdownParser.parse(text).toJSON();
    } else {
      docJSON = contents;
    }
    _this.create({ place: place, contents: docJSON, plugins: plugins });
    return _this;
  }

  _createClass(DiffEditor, [{
    key: 'linkEditor',
    value: function linkEditor(linkedEditor, _ref2) {
      var showAsAdditions = _ref2.showAsAdditions;

      var _require3 = require('../pubpubSetup'),
          pubpubSetup = _require3.pubpubSetup;

      var plugins = pubpubSetup({ schema: _schema.schema });
      var diffPlugins = plugins.concat(_plugins.DiffPlugin);
      _get(DiffEditor.prototype.__proto__ || Object.getPrototypeOf(DiffEditor.prototype), 'reconfigure', this).call(this, diffPlugins, { linkedEditor: linkedEditor, originalEditor: this, showAsAdditions: showAsAdditions });
    }
  }, {
    key: 'linkedTransform',
    value: function linkedTransform() {
      var action = { type: 'linkedTransform' };
      this._onAction(action);
    }
  }, {
    key: 'patchDiff',
    value: function patchDiff() {}

    // if newState exists, then use that instead of the default state
    // this is useful if called by an action to get the top most diff

  }, {
    key: 'getDiffStr',
    value: function getDiffStr(newState) {
      var doc = void 0;
      var diffMap = {};
      if (!newState) {
        doc = this.view.state.doc;
      } else {
        doc = newState.doc;
      }
      var nodeSize = doc.nodeSize;
      var diffStr = "";

      // non-leaf tokens have a start and end size
      for (var nodeIndex = 0; nodeIndex < nodeSize - 1; nodeIndex++) {
        var child = doc.nodeAt(nodeIndex);
        // console.log(child);
        if (child) {
          var diffText = '';
          if (child.isText) {
            diffText = '"' + child.text + '"';
            // diffText = child.text
            if (child.text.length !== child.nodeSize) {
              console.log('WOAH THIS IS AN ISSUE');
            }
            for (var j = 0; j < child.nodeSize; j++) {
              diffMap[diffStr.length + j + 1] = nodeIndex + j;
            }
            nodeIndex += child.nodeSize - 1;
          }
          // can we generalize this to any block?
          else if (child.type.name === 'block_embed') {
              var attrsStr = JSON.stringify(child.attrs);
              // diffText = 'embed' + attrsStr + ' ';
              var attrHash = _murmurhash2.default.v3(attrsStr);
              diffText = 'embed' + attrHash + ' ';
              for (var j = 0; j < diffText.length - 1; j++) {
                diffMap[diffStr.length + j] = { type: 'embed', index: nodeIndex };
              }
            } else {
              diffText = child.type.name.charAt(0);
              diffMap[diffStr.length] = nodeIndex;
              // node attrs
            }
          diffStr += diffText;
        } else {
          diffStr += " ";
        }
      }
      console.log(diffStr);
      // console.log(diffMap);
      return { diffStr: diffStr, diffMap: diffMap };
    }

    /*
     create({place, contents, plugins}) {
        const otherEditor = this.otherEditor;
       // const diffPlugins = plugins.concat(diffPlugin);
        super.create({place, contents, plugins: plugins, config: {otherEditor: 'test'}});
     }
    */

  }]);

  return DiffEditor;
}(_richEditor.AbstractEditor);

exports.DiffEditor = DiffEditor;