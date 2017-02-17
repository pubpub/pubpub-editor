"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var prefix = "ProseMirror-prompt";

function openPrompt(options) {
  var wrapper = document.body.appendChild(document.createElement("div"));
  wrapper.className = prefix;

  var mouseOutside = function mouseOutside(e) {
    if (!wrapper.contains(e.target)) close();
  };
  setTimeout(function () {
    return window.addEventListener("mousedown", mouseOutside);
  }, 50);
  var close = function close() {
    window.removeEventListener("mousedown", mouseOutside);
    if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
  };

  var domFields = [];
  for (var name in options.fields) {
    domFields.push(options.fields[name].render());
  }var submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.className = prefix + "-submit";
  submitButton.textContent = "OK";
  var cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.className = prefix + "-cancel";
  cancelButton.textContent = "Cancel";
  cancelButton.addEventListener("click", close);

  var form = wrapper.appendChild(document.createElement("form"));
  if (options.title) form.appendChild(document.createElement("h5")).textContent = options.title;
  domFields.forEach(function (field) {
    form.appendChild(document.createElement("div")).appendChild(field);
  });
  var buttons = form.appendChild(document.createElement("div"));
  buttons.className = prefix + "-buttons";
  buttons.appendChild(submitButton);
  buttons.appendChild(document.createTextNode(" "));
  buttons.appendChild(cancelButton);

  var box = wrapper.getBoundingClientRect();
  wrapper.style.top = (window.innerHeight - box.height) / 2 + "px";
  wrapper.style.left = (window.innerWidth - box.width) / 2 + "px";

  var submit = function submit() {
    var params = getValues(options.fields, domFields);
    if (params) {
      close();
      options.callback(params);
    }
  };

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    submit();
  });

  form.addEventListener("keydown", function (e) {
    if (e.keyCode == 27) {
      e.preventDefault();
      close();
    } else if (e.keyCode == 13 && !(e.ctrlKey || e.metaKey || e.shiftKey)) {
      e.preventDefault();
      submit();
    } else if (e.keyCode == 9) {
      window.setTimeout(function () {
        if (!wrapper.contains(document.activeElement)) close();
      }, 500);
    }
  });

  var input = form.elements[0];
  if (input) input.focus();
}
exports.openPrompt = openPrompt;

function getValues(fields, domFields) {
  var result = Object.create(null),
      i = 0;
  for (var name in fields) {
    var field = fields[name],
        dom = domFields[i++];
    var value = field.read(dom),
        bad = field.validate(value);
    if (bad) {
      reportInvalid(dom, bad);
      return null;
    }
    result[name] = field.clean(value);
  }
  return result;
}

function reportInvalid(dom, message) {
  // FIXME this is awful and needs a lot more work
  var parent = dom.parentNode;
  var msg = parent.appendChild(document.createElement("div"));
  msg.style.left = dom.offsetLeft + dom.offsetWidth + 2 + "px";
  msg.style.top = dom.offsetTop - 5 + "px";
  msg.className = "ProseMirror-invalid";
  msg.textContent = message;
  setTimeout(function () {
    return parent.removeChild(msg);
  }, 1500);
}

// ::- The type of field that `FieldPrompt` expects to be passed to it.

var Field = function () {
  // :: (Object)
  // Create a field with the given options. Options support by all
  // field types are:
  //
  // **`value`**`: ?any`
  //   : The starting value for the field.
  //
  // **`label`**`: string`
  //   : The label for the field.
  //
  // **`required`**`: ?bool`
  //   : Whether the field is required.
  //
  // **`validate`**`: ?(any) → ?string`
  //   : A function to validate the given value. Should return an
  //     error message if it is not valid.
  function Field(options) {
    _classCallCheck(this, Field);

    this.options = options;
  }

  // render:: (state: EditorState, props: Object) → dom.Node
  // Render the field to the DOM. Should be implemented by all subclasses.

  // :: (dom.Node) → any
  // Read the field's value from its DOM node.


  _createClass(Field, [{
    key: "read",
    value: function read(dom) {
      return dom.value;
    }

    // :: (any) → ?string
    // A field-type-specific validation function.

  }, {
    key: "validateType",
    value: function validateType(_value) {}
  }, {
    key: "validate",
    value: function validate(value) {
      if (!value && this.options.required) return "Required field";
      return this.validateType(value) || this.options.validate && this.options.validate(value);
    }
  }, {
    key: "clean",
    value: function clean(value) {
      return this.options.clean ? this.options.clean(value) : value;
    }
  }]);

  return Field;
}();

exports.Field = Field;

// ::- A field class for single-line text fields.

var TextField = function (_Field) {
  _inherits(TextField, _Field);

  function TextField() {
    _classCallCheck(this, TextField);

    return _possibleConstructorReturn(this, (TextField.__proto__ || Object.getPrototypeOf(TextField)).apply(this, arguments));
  }

  _createClass(TextField, [{
    key: "render",
    value: function render() {
      var input = document.createElement("input");
      input.type = "text";
      input.placeholder = this.options.label;
      input.value = this.options.value || "";
      input.autocomplete = "off";
      return input;
    }
  }]);

  return TextField;
}(Field);

exports.TextField = TextField;

// ::- A field class for dropdown fields based on a plain `<select>`
// tag. Expects an option `options`, which should be an array of
// `{value: string, label: string}` objects, or a function taking a
// `ProseMirror` instance and returning such an array.

var SelectField = function (_Field2) {
  _inherits(SelectField, _Field2);

  function SelectField() {
    _classCallCheck(this, SelectField);

    return _possibleConstructorReturn(this, (SelectField.__proto__ || Object.getPrototypeOf(SelectField)).apply(this, arguments));
  }

  _createClass(SelectField, [{
    key: "render",
    value: function render() {
      var _this3 = this;

      var select = document.createElement("select");
      this.options.options.forEach(function (o) {
        var opt = select.appendChild(document.createElement("option"));
        opt.value = o.value;
        opt.selected = o.value == _this3.options.value;
        opt.label = o.label;
      });
      return select;
    }
  }]);

  return SelectField;
}(Field);

exports.SelectField = SelectField;