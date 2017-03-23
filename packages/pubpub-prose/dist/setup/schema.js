'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.createSchema = exports.schema = undefined;

var _prosemirrorModel = require('prosemirror-model');

var _prosemirrorSchemaList = require('prosemirror-schema-list');

var _prosemirrorSchemaTable = require('prosemirror-schema-table');

var _schemaBasic = require('./schema-basic');

// ;; An inline embed node type. Has these attributes:
//
// - **`src`** (required): The slug of the pub.
// - **`className`**: An optional className for styling.
// - **`id`**: An option id for styling to linking.
// - **`align`**: inline, left, right, or full
// - **`size`**: CSS valid width
// - **`caption`**: String caption to place under the embed
// - **`data`**: Cached version/atom data. This is not serialized into markdown (in the long-term), but is kept here for fast rendering

var SubMark = {
	parseDOM: [{ tag: "sub" }],
	toDOM: function toDOM() {
		return ["sub"];
	}
};

var SupMark = {
	parseDOM: [{ tag: "sup" }],
	toDOM: function toDOM() {
		return ["sup"];
	}
};

var StrikeThroughMark = {
	parseDOM: [{ tag: "s" }],
	toDOM: function toDOM() {
		return ["s"];
	}
};

var PageBreak = {
	group: "block",
	toDOM: function toDOM(node) {
		return ['div', { class: 'pagebreak' }, 'pagebreak'];
	}
};

var Emoji = {
	group: 'inline',
	attrs: {
		content: { default: '' },
		markup: { default: '' }
	},
	toDOM: function toDOM(node) {
		return ['span', node.attrs.content];
	},
	inline: true
};

var schemaNodes = _schemaBasic.schema.spec.nodes.addBefore('horizontal_rule', 'page_break', PageBreak).addBefore('image', 'emoji', Emoji);

var listSchema = (0, _prosemirrorSchemaList.addListNodes)(schemaNodes, "paragraph block*", "block");
var tableSchema = (0, _prosemirrorSchemaTable.addTableNodes)(listSchema, "paragraph block*", "block");

var schema = exports.schema = new _prosemirrorModel.Schema({
	nodes: tableSchema,
	marks: _schemaBasic.schema.spec.marks.addBefore('code', 'sub', SubMark).addBefore('code', 'sup', SupMark).addBefore('code', 'strike', StrikeThroughMark),
	topNode: 'doc'
});

var createSchema = exports.createSchema = function createSchema() {
	return new _prosemirrorModel.Schema({
		nodes: tableSchema,
		marks: _schemaBasic.schema.markSpec.addBefore('code', 'sub', SubMark).addBefore('code', 'sup', SupMark).addBefore('code', 'strike', StrikeThroughMark)
	});
};

var EmbedType = schema.nodes.embed;

exports.Embed = EmbedType;

var migrateMarks = function migrateMarks(node) {
	// console.log('Node', node);
	if (!node) {
		return null;
	}
	if (node.content) {
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = node.content[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var subNode = _step.value;

				migrateMarks(subNode);
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}
	}
	if (node.marks) {
		node.marks = node.marks.map(function (mark) {
			if (!mark._) {
				return mark;
			}
			return {
				type: mark._
			};
		});
	}
	if (node.slice) {
		migrateMarks(node.slice);
	}
};

exports.migrateMarks = migrateMarks;

var migrateDiffs = function migrateDiffs(diffs) {
	var _iteratorNormalCompletion2 = true;
	var _didIteratorError2 = false;
	var _iteratorError2 = undefined;

	try {
		for (var _iterator2 = diffs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
			var diff = _step2.value;

			migrateMarks(diff);
		}
	} catch (err) {
		_didIteratorError2 = true;
		_iteratorError2 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion2 && _iterator2.return) {
				_iterator2.return();
			}
		} finally {
			if (_didIteratorError2) {
				throw _iteratorError2;
			}
		}
	}
};

exports.migrateDiffs = migrateDiffs;