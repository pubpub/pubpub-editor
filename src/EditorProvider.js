import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
	view: PropTypes.object,
	editorState: PropTypes.object,
	transaction: PropTypes.object,
	containerId: PropTypes.string,
	children: PropTypes.node
};

const defaultProps = {
	view: undefined,
	editorState: undefined,
	transaction: undefined,
	containerId: undefined,
	children: undefined,
};

const EditorProvider = function(props) {
	const { view, containerId, editorState, children, transaction } = props;
	return (
		<div>
			{ React.Children.map(children, (child) => {
				return React.cloneElement(child, { view, containerId, editorState, transaction });
			})}
		</div>
	);
};

EditorProvider.propTypes = propTypes;
EditorProvider.defaultProps = defaultProps;
export default EditorProvider;
