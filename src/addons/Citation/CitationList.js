import React from 'react';
import PropTypes from 'prop-types';
import { NonIdealState } from '@blueprintjs/core';

require('./citation.scss');

const propTypes = {
	listItems: PropTypes.array.isRequired,
	isSelected: PropTypes.bool,
};

const defaultProps = {
	isSelected: false,
};

const CitationList = function(props) {
	return (
		<ol className={`citation-list-wrapper ${props.isSelected ? 'isSelected' : ''}`}>
			{props.listItems.map((item)=> {
				return (
					<li key={`citation-list-item-${item.count}`} className="citation-list-item">
						<span className="count">
							[{item.count}]
						</span>
						<span
							className="rendered-citation"
							dangerouslySetInnerHTML={{ __html: item.html }}
						/>
					</li>
				);
			})}
			{!props.listItems.length &&
				<NonIdealState
					title="No citations"
					description="This pub does not have any citations to list."
				/>
			}
		</ol>
	);
};

CitationList.propTypes = propTypes;
CitationList.defaultProps = defaultProps;
export default CitationList;
