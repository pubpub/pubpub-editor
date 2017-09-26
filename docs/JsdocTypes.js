/**
 * HTML class names to be added to the rendered component.
 *
 * @typedef {string} ClassName
 */

/**
 * An object of attributes to be applied to the outer-most HTML tag of the component.
 *
 * @typedef {Object} HtmlProps
 */

/**
 * Spruce modifiers. Pass a string to add modifiers (space-separated if multiple)
 * or if you provide an object then only the names of the object's keys that evaluate to true will be added as modifiers.
 *
 * @typedef {(string|Object<string,boolean>)} SpruceModifier
 */

/**
 * Spruce peer modifiers. Pass a string to add modifiers (space-separated if multiple)
 * or if you provide an object then only the names of the object's keys that evaluate to true will be added as modifiers.
 *
 * @typedef {(string|Object<string,boolean>)} SprucePeer
 */

/**
 * A callback that is called by input components to notify parents of changes in their values.
 *
 * @callback OnChange
 * @param {string} newValue The input's new value.
 * @param {OnChangeMeta} meta
 */

/**
 * A callback that is called by input components to notify parents of changes in their values.
 *
 * @callback OnChangeBoolean
 * @param {boolean} newValue The input's new value.
 * @param {OnChangeMeta} meta
 */

/**
 * Meta information about the change
 *
 * @typedef OnChangeMeta
 * @property {Object} event The event that triggered the change
 * @property {Object} element The HTML element that triggered the change
 */

/**
 * A callback that is called by input components to notify parents of changes in their values.
 *
 * @callback OnChangeMulti
 * @param {Array<string|boolean>} newValue The input's new value.
 * @param {OnChangeMeta} meta
 */

/**
 * A callback that is called by input component to notify parents of changes to their values.
 *
 * @callback OnClick
 * @param {Function} event The element's HTML click event.
 */

/**
 * The base class name to use with the Spruce naming convention for this component.
 *
 * @typedef {string} SpruceName
 */

/**
 * A function to configure hocks.
 *
 * @callback HockConfig
 * @param {Object} props The current props.
 * @returns {Object}
 */

/**
 * @callback HockApplier
 *
 * @param {ReactComponent} Component
 * The component to wrap in this hock.
 */

/**
 * @typedef {Array<string>|List<string>} ValueChangePair
 * Use with pipes, the value/change pair specify the names of
 * matching value and onChange function, to receive and modify a value.
 * They should always have exactly 2 elements.
 */

// externals

/**
 * Immutable.js Iterable
 * @typedef Iterable
 * @noexpand
 * @see https://facebook.github.io/immutable-js/docs/#/Iterable
 */

/**
 * Immutable.js List
 * @typedef List
 * @noexpand
 * @see https://facebook.github.io/immutable-js/docs/#/List
 */

/**
 * Immutable.js Map
 * @typedef Map
 * @noexpand
 * @see https://facebook.github.io/immutable-js/docs/#/Map
 */

/**
 * Immutable.js OrderedMap
 * @typedef OrderedMap
 * @noexpand
 * @see https://facebook.github.io/immutable-js/docs/#/OrderedMap
 */

/**
 * Immutable.js Record
 * @typedef Record
 * @noexpand
 * @see https://facebook.github.io/immutable-js/docs/#/Record
 */

/**
 * React Component
 * @typedef ReactComponent
 * @noexpand
 * @see https://facebook.github.io/react/docs/react-component.html
 */

/**
 * React Element
 * @typedef ReactElement
 * @noexpand
 * @see https://facebook.github.io/react/docs/react-component.html
 */
