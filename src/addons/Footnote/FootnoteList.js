import React from 'react';
import PropTypes from 'prop-types';
import { NonIdealState } from '@blueprintjs/core';

require('./footnote.scss');

const propTypes = {
	listItems: PropTypes.array.isRequired,
	isSelected: PropTypes.bool,
};

const defaultProps = {
	isSelected: false,
};

const FootnoteList = function(props) {
	return (
		<ol className={`footnote-list-wrapper ${props.isSelected ? 'isSelected' : ''}`}>
			{props.listItems.map((item)=> {
				return (
					<li key={`footnote-list-item-${item.count}`} className="footnote-list-item">
						<span className="count">
							{item.count}.
						</span>
						<span
							className="rendered-footnote"
							dangerouslySetInnerHTML={{ __html: item.value }}
						/>
					</li>
				);
			})}
			{!props.listItems.length &&
				<NonIdealState
					title="No footnotes"
					description="This pub does not have any footnotes to list."
				/>
			}
		</ol>
	);
};

FootnoteList.propTypes = propTypes;
FootnoteList.defaultProps = defaultProps;
export default FootnoteList;
