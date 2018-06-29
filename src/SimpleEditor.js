import React, { Component } from 'react';
import { EditorState, PluginKey, Selection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema, DOMParser } from 'prosemirror-model';
import PropTypes from 'prop-types';
import { marks, nodes } from './schema/baseSchema';
import { getBasePlugins } from './schema/setup';

const propTypes = {
	initialHtmlString: PropTypes.string,
	editorId: PropTypes.string,
	onChange: PropTypes.func,
	placeholder: PropTypes.string,
	isReadOnly: PropTypes.bool,
};

const defaultProps = {
	initialHtmlString: '',
	editorId: undefined,
	onChange: undefined,
	placeholder: '',
	isReadOnly: false,
};

/**
 * @module Components
 */

/**
* @component
*
* The SimpleEditor component provides an editor with support for paragraphs and marks. 
*
* @prop {string} initialHtmlString A string of HTML representing the initial content.
* @prop {func} onChange Fired whenever the document is changed. Provided an HTML string of the content.
* @prop {String} placeholder A placeholder string that will appear if there is no content.
* @prop {bool} isReadOnly Set to true to disallow editing, both in text and modifying or inserting add ons.
*
* @example
return <SimpleEditor />
*/
class SimpleEditor extends Component {
	constructor(props) {
		super(props);
		this.containerId = props.editorId
			? `pubpub-simple-editor-container-${props.editorId}`
			: `pubpub-simple-editor-container-${Math.round(Math.random() * 10000)}`;
		this.view = undefined;
		this._onAction = this._onAction.bind(this);
	}

	componentDidMount() {
		this.createEditor();
	}
	componentWillUnmount() {
	}
	/**
	 * Get HtmlString
	 * @return {string} The HTML string of the document. Useful for saving documents for use in initialHtmlString.
	 */
	getHtmlString() {
		return this.view.state.doc.toJSON();
	}
	/**
	 * Get Text
	 * @return {string} The plain text content of an editor instance
	 */
	getText() {
		return this.view.state.doc.textContent;
	}

	focus() {
		this.view.focus();
	}

	createEditor() {
		const simpleSchema = new Schema({
			nodes: {
				doc: nodes.doc,
				paragraph: nodes.paragraph,
				text: nodes.text,
			},
			marks: marks,
		});
		
		const wrapperElem = document.createElement('div');
		wrapperElem.innerHTML = this.props.initialHtmlString;

		const editorState = EditorState.create({
			doc: DOMParser.fromSchema(simpleSchema).parse(wrapperElem),
			schema: simpleSchema,
			plugins: getBasePlugins({
				schema: simpleSchema,
				placeholder: this.props.placeholder,
			})
		});
		this.view = new EditorView(document.getElementById(this.containerId), {
			state: editorState,
			dispatchTransaction: this._onAction,
		});
	}

	_onAction(transaction) {
		if (this.view && this.view.state) {
			const newState = this.view.state.apply(transaction);
			this.view.updateState(newState);
			
			if (this.props.onChange && transaction.docChanged) {
				this.props.onChange(this.editorElement.children[0].innerHTML);
			}
		}
	}

	render() {
		return (
			<div
				ref={(elem)=> { this.editorElement = elem; }}
				className="pubpub-simple-editor"
				id={this.containerId}
			/>
		);
	}
}

SimpleEditor.propTypes = propTypes;
SimpleEditor.defaultProps = defaultProps;
export default SimpleEditor;
