/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';

require('./citationList.scss');

const propTypes = {
	attrs: PropTypes.object.isRequired,
	// options: PropTypes.object.isRequired,
	isSelected: PropTypes.bool.isRequired,
	// isEditable: PropTypes.bool.isRequired,
};

const CitationList = (props) => {
	const attrs = props.attrs;
	const listItems = attrs.listItems || [];
	return (
		<ol
			className={`citation-list-wrapper ${props.isSelected ? 'isSelected' : ''}`}
			tabIndex={-1}
		>
			{listItems.map((item) => {
				return (
					<li key={`citation-list-item-${item.count}`} className="citation-list-item">
						<span className="count">[{item.count}]</span>
						<span
							className="rendered-citation structured-value"
							dangerouslySetInnerHTML={{ __html: item.html }}
						/>
						<span
							className="rendered-citation unstructured-value"
							dangerouslySetInnerHTML={{ __html: item.unstructuredValue }}
						/>
					</li>
				);
			})}
			{!listItems.length && (
				<div className="empty-state">
					<p>
						<b>No Citations</b>
					</p>
					<p>This pub does not have any citations to list.</p>
				</div>
			)}
		</ol>
	);
};

CitationList.propTypes = propTypes;
export default CitationList;
