import React, { PropTypes } from 'react';
import CodeMirror from 'codemirror';

require('../../style/code.scss');

let styles;
export const CodeEditor = React.createClass({
	propTypes: {
		initialContent: PropTypes.string,
		onChange: PropTypes.func,
	},

	codeMirror: undefined,

	componentDidMount() {
		const element = document.getElementById('myCodeEditor');
		if (element) {
			this.codeMirror = CodeMirror.fromTextArea(element, {
				autofocus: true,
			});

			if (this.props.onChange) {
				this.codeMirror.on('change', (cm)=> {
					this.props.onChange(cm.doc.getValue());
				});	
			}
		}
	},

	componentWillReceiveProps(nextProps) {
		if (this.props.initialContent !== nextProps.initialContent) {
			this.codeMirror.value(nextProps.initialContent);
		}
	},


	render() {
		return (
			<div id={'code-editor-container'} style={styles.container}>
				<textarea id={'myCodeEditor'} value={this.props.initialContent} />
			</div>
		);
	},

});

export default CodeEditor;

styles = {
	container: {
		position: 'relative',
	},
};
