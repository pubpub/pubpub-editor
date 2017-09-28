import { Button, Menu, MenuItem, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';
import React, { Component } from 'react';

import { PluginKey } from 'prosemirror-state';
import PropTypes from 'prop-types';
import TrackChangesPlugin from './TrackChangesPlugin';

let styles;

require('./trackChanges.scss');


const trackKey = new PluginKey('track');
// how to track firebase changes well?
// how to use other keys in the export?
// store plugin keys with others?
// create a track plugin

const propTypes = {
	view: React.PropTypes.object,
};

const defaultProps = {
	view: undefined,
};



class TrackAddon extends Component {

	static getPlugins() {
		return [ TrackChangesPlugin(trackKey) ];
	}

	static schema({ }) {
		return {
			marks: {
				diff_plus: {
					attrs: {
						commitID: { default: null }
					},
					parseDOM: [],
					toDOM(node) { return ['span', { class: `diff-marker added`, "data-commit": node.attrs.commitID }, 0]; },
					excludes: "diff_minus",
				},
				diff_minus: {
					attrs: {
						commitID: { default: null }
					},
					parseDOM: [],
					toDOM(node) { return ['span', { class: `diff-marker removed`, "data-commit": node.attrs.commitID }, 0]; },
					excludes: "diff_plus"
				},
			}
		}
	}

	constructor(props) {
		super(props);
		this.state = { };
	}
	/*
	componentWillReceiveProps(nextProps) {
		if (this.props.editorState !== nextProps.editorState) {
			this.onChange(nextProps);
		}
	},
	onChange(props) {
		const { editorState, transaction } = props;
		if (!editorState || !transaction) {
			return;
		}
	},

	fork(forkID) {
		const { editorState } = this.props;

		let firebasePlugin;
		if (firebasePlugin = firebaseKey.get(editorState)) {
			return firebasePlugin.props.fork.bind(firebasePlugin)(forkID);
		}
		return Promise.resolve(null);
	},

	getForks() {
		const { editorState } = this.props;

		let firebasePlugin;
		if (firebasePlugin = firebaseKey.get(editorState)) {
			return firebasePlugin.props.getForks.bind(firebasePlugin)();
		}
		return Promise.resolve(null);
	},
		*/


	render() {

		const { view } = this.props;
		if (!view) {
			return null;
		}

		return (<div></div>);

		return (
			<div>
				<div>
					<Button onClick={this.joinParent.bind(this, this.state.forkParent)} iconName="circle-arrow-left" text={"hey this is a commit"} />

					{this.state.commits.map((commit) => {
						return (<CommitMsg onCommitHighlight={this.onCommitHighlight} clearCommitHighlight={this.clearCommitHighlight} commit={commit}/>);
					})}

				</div>
			</div>
		);
	}

}

export default TrackAddon;
