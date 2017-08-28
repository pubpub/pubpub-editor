import { Button, Menu, MenuItem, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';
import React, { PropTypes } from 'react';

import RenderDocument from './RenderDocument';

const CommitHighlightRebase = ({ commit, acceptCommit, index }) => {
  const onClick = () => {
    acceptCommit(index);
  };

	return (
		<div
			style={{width: '150px', height: 'auto', marginBottom: 10, padding: '5px 10px', display: 'block', backgroundColor: '#eee', cursor: 'pointer'}} >
			{commit.description}
			{(!commit.merged) ?
				<div style={{marginTop: 6}}><Button minimal onClick={onClick} iconName="fork" text="Accept" /></div>
			:
				<div style={{marginTop: 6}}>MERGED</div>
			}
		</div>);
}


export const RenderDocumentRebase = React.createClass({

	propTypes: {
		doc: PropTypes.object,
		commits: PropTypes.array,
    acceptCommit: PropTypes.func,
	},

	getInitialState() {
		return {
      commitUUID: null,
		}
	},

	clickDoc: function(evt) {

		const target = evt.target;
		let parent = target;
		let commitUUID = null;
		while ((parent = parent.parentNode)) {
			if (parent && parent.getAttribute && parent.getAttribute('data-commit')) {
				commitUUID = parent.getAttribute('data-commit');
				break;
			}
		}

		if (commitUUID && this.state.commitUUID !== commitUUID) {
      const boundingRect = this.rebaseContainer.getBoundingClientRect();
			this.setState({ commitUUID, commitX: evt.clientX - boundingRect.left, commitY: evt.clientY - boundingRect.top });
		} else {
      this.setState({ commitUUID: null });
    }
	},

	render: function() {

    const { doc, commits, acceptCommit } = this.props;
		const { commitUUID, commitX, commitY } = this.state;

    let selectedCommit = null;
    let selectedIndex = null;
    if (commitUUID !== null) {
      selectedIndex = commits.findIndex((commit) => (commit.uuid === commitUUID));
      selectedCommit = commits[selectedIndex];
    }

    const mergedCommits = commits.filter((commit) => (commit.merged));

		return (
				<div ref={(rebaseContainer) => { this.rebaseContainer = rebaseContainer; }} style={{ position: 'relative' }} onClick={this.clickDoc}>
          <style>
  					{commitUUID !== null && `
  						[data-commit="${commitUUID}"] {
  							background-color: red !important;
  						}
  					`}
            {mergedCommits.map((commit) => (
              `
                [data-commit="${commit.uuid}"] {
    							background-color: green !important;
    						}
              `
            )).join(' ')}
  				</style>

					{(selectedCommit) ?
						<div style={{ position: 'absolute', left: commitX, top: commitY }}>
              <CommitHighlightRebase commit={selectedCommit} index={selectedIndex} acceptCommit={acceptCommit} />
            </div>
					: null}
					<RenderDocument allReferences={[]} allFiles={[]} json={doc} />
				</div>
		);
	}
});

export default RenderDocumentRebase;
