/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';

require('./footnoteList.scss');

const propTypes = {
	attrs: PropTypes.object.isRequired,
	// options: PropTypes.object.isRequired,
	isSelected: PropTypes.bool.isRequired,
	// isEditable: PropTypes.bool.isRequired,
};

const FootnoteList = (props) => {
	const attrs = props.attrs;
	return (
		<ol className={`footnote-list-wrapper ${props.isSelected ? 'isSelected' : ''}`}>
			{attrs.listItems.map((item) => {
				return (
					<li key={`footnote-list-item-${item.count}`} className="footnote-list-item">
						<span className="count">{item.count}.</span>
						<span
							className="rendered-footnote unstructured-value"
							dangerouslySetInnerHTML={{ __html: item.value }}
						/>
						<span
							className="rendered-footnote structured-value"
							dangerouslySetInnerHTML={{ __html: item.structuredHtml }}
						/>
					</li>
				);
			})}
			{!attrs.listItems.length && (
				<div className="empty-state">
					<p>
						<b>No Footnotes</b>
					</p>
					<p>This pub does not have any footnotes to list.</p>
				</div>
			)}
		</ol>
	);
};

FootnoteList.propTypes = propTypes;
export default FootnoteList;
