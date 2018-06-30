import React from 'react';
import PropTypes from 'prop-types';
import { NonIdealState } from '@blueprintjs/core';

require('./citation.scss');

const propTypes = {
	view: PropTypes.object,
	isSelected: PropTypes.bool,
	isEditable: PropTypes.bool
};

const defaultProps = {
	view: undefined,
	isSelected: false,
	isEditable: false,
};

const CitationList = function(props) {
	if (!props.view) { return null; }
	const citations = [];
	const usedIndexes = {};

	props.view.state.doc.nodesBetween(
		0,
		props.view.state.doc.nodeSize - 2,
		(node)=> {
			if (node.type.name === 'citation') {
				if (!usedIndexes[node.attrs.count]) {
					citations.push(node.attrs);
					usedIndexes[node.attrs.count] = true;
				}
			}
			return true;
		}
	);

	if (!citations.length && !props.isEditable) { return null; }

	return (
		<ol className={`citation-list-wrapper ${props.isSelected ? 'isSelected' : ''}`}>
			{citations.map((item)=> {
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
			{!citations.length &&
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
