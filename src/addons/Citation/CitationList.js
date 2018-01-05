import React from 'react';
import PropTypes from 'prop-types';
import { NonIdealState } from '@blueprintjs/core';

require('./citation.scss');

const propTypes = {
	view: PropTypes.object.isRequired,
	isSelected: PropTypes.bool,
	isEditable: PropTypes.bool
};

const defaultProps = {
	isSelected: false,
	isEditable: false,
};

const CitationList = function(props) {
	if (!props.view) { return null; }
	const citations = [];
	const usedIndexes = {};
	for (let nodeIndex = 0; nodeIndex < props.view.state.doc.nodeSize - 1; nodeIndex++) {
		const curr = props.view.state.doc.nodeAt(nodeIndex);
		if (curr && curr.type.name === 'citation') {
			if (!usedIndexes[curr.attrs.count]) {
				citations.push(curr.attrs);
				usedIndexes[curr.attrs.count] = true;
			}
		}
	}

	if (!citations.length && !props.isEditable) { return null; }

	return (
		<ol className={`citation-list-wrapper ${props.isSelected ? 'selected' : ''} ${props.isEditable ? 'editable' : ''}`}>
			{citations.map((item)=> {
				return (
					<li key={`citation-list-item-${item.count}`} className={'citation-list-item'}>
						<span className={'count'}>[{item.count}]</span>
						<span
							className={'rendered-citation'}
							dangerouslySetInnerHTML={{ __html: item.html }}
						/>
					</li>
				);
			})}
			{!citations.length &&
				<NonIdealState
					title={'No citations'}
					description={'This pub does not have any citations to list.'}
				/>
			}
		</ol>
	);
};

CitationList.propTypes = propTypes;
CitationList.defaultProps = defaultProps;
export default CitationList;
