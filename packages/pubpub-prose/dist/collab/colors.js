'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CSS_COLORS = ['0,119,190', '217,58,50', '0,0,160', '119,190,0', '97,255,105', '173,216,230', '128,0,128', '128,128,128', '255,165,0'];

/* Create a CSS stylesheet for the colors of all users. */

var ModCollabColors = exports.ModCollabColors = function () {
	function ModCollabColors(mod) {
		_classCallCheck(this, ModCollabColors);

		mod.colors = this;
		this.mod = mod;
		this.cssColorDefinitions = [];
		this.userColorStyle = false;
		this.setup();
	}

	_createClass(ModCollabColors, [{
		key: 'setup',
		value: function setup() {
			var styleContainers = document.createElement('temp');
			styleContainers.innerHTML = '<style type="text/css" id="user-colors"></style>';
			while (styleContainers.firstElementChild) {
				document.head.appendChild(styleContainers.firstElementChild);
			}
			this.userColorStyle = document.getElementById('user-colors');
		}

		// Ensure that there are at least the given number of user color styles.

	}, {
		key: 'provideUserColorStyles',
		value: function provideUserColorStyles(number) {
			if (this.cssColorDefinitions.length < number) {
				var start = this.cssColorDefinitions.length;
				for (var index = start; index < number; index++) {
					var color = index < CSS_COLORS.length ? CSS_COLORS[index] : Math.round(Math.random() * 255) + ',' + Math.round(Math.random() * 255) + ',' + Math.round(Math.random() * 255);
					var styleDefinition = '.user-' + index + ' {border-color: rgba(' + color + ',1)} .user-bg-' + index + ' {background-color: rgba(' + color + ',0.2)}';
					this.cssColorDefinitions.push(styleDefinition);
				}
				this.userColorStyle.innerHTML = this.cssColorDefinitions.join('\n');
			}
		}
	}]);

	return ModCollabColors;
}();