/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';

require('./citation.scss');

const propTypes = {
	attrs: PropTypes.object.isRequired,
	// options: PropTypes.object.isRequired,
	isSelected: PropTypes.bool.isRequired,
	// isEditable: PropTypes.bool.isRequired,
	editorProps: PropTypes.object,
};

const defaultProps = {
	editorProps: {},
};

const Citation = (props) => {
	const attrs = props.attrs;

	return (
		<span className="citation-wrapper" tabIndex={-1}>
			<span className={`count-wrapper ${props.isSelected ? 'isSelected' : ''}`}>
				<span className="citation">[{attrs.count}]</span>
			</span>
			{!props.editorProps.renderStaticMarkup && (
				<span className="render-wrapper">
					{attrs.value && <span dangerouslySetInnerHTML={{ __html: attrs.html }} />}
					{attrs.unstructuredValue && (
						<span dangerouslySetInnerHTML={{ __html: attrs.unstructuredValue }} />
					)}
					{!attrs.value && !attrs.unstructuredValue && (
						<span className="empty-text">No Citation text entered...</span>
					)}
				</span>
			)}
		</span>
	);
};

Citation.propTypes = propTypes;
Citation.defaultProps = defaultProps;
export default Citation;
