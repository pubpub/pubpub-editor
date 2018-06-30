import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TrackChangesPlugin from './trackChangesPlugin';

require('./trackChanges.scss');

/* Track Changes Thinking
On every transaction:
- check to see if it is an input transaction
- calculate the change set
- calculate the difference of formatting, etc
- calculate how to invert the new group of steps (in case of rejection)


If a user deletes another users insert, the two overlap.
Rejecting the original insert deletes the deletion.
Accepting the original insert leaves the deletion in place.
If a user deletes within their own insert, it simply changes the insertion.
If a user inserts within their own deletion, it simply changes the deletion.

If you are in suggest mode, you are writing up as suggests. Others don't have to do
any change tracking. You are responsible for your own changes.


For diffing between versions, do we store all steps that were taken to get to a specific version?

What do we do with 'Save Version'? Are all suggestions rejected on save version? Accepted?
*/

const propTypes = {
	isActive: PropTypes.func,
	usersData: PropTypes.object,
	userId: PropTypes.string,

	containerId: PropTypes.string,
	view: PropTypes.object,
	editorState: PropTypes.object,
};

const defaultProps = {
	isActive: ()=> { return false; },
	usersData: {},
	userId: '',
	containerId: undefined,
	view: undefined,
	editorState: undefined,
};

/**
* @module Addons
*/

/**
* @component
*
* When enabled, converts all steps into diff steps. And provides an interface for accepting or rejecting changes.
*
* @prop {func} [isActive] Since child elements are cloned, and can't receive updated props, we pass in a function that will return true or false, as to whether track changes is active.
* @prop {object} [usersData] An object with userIds as keys, and user data as the value. Used to populate names, images, etc for users.
*
* @example
return (
	<Editor>
 		<TrackChanges isActive={()=> { return true; }}/>
	</Editor>
);
*/
class TrackChanges extends Component {
	static pluginName = 'TrackChanges';

	static getPlugins({ pluginKey, isActive, usersData, userId }) {
		return [
			new TrackChangesPlugin({
				pluginKey: pluginKey,
				isActive: isActive,
				usersData: usersData,
				userId: userId,
			})
		];
	}

	static schema = (props)=> {
		return {
			marks: {
				insertion: {
					inclusive: false,
					attrs: {
						userId: { default: '' },
						editType: { default: '' },
						addedFormats: { default: [] },
						removedFormats: { default: [] },
					},
					parseDOM: [
						{
							tag: 'insertion', // This is intentionally not going to match. We don't want to allow pasting of insertions
							getAttrs: (dom)=> {
								return {
									userId: dom.getAttribute('data-user-id'),
									editType: dom.getAttribute('data-edit-type'),
									addedFormats: dom.getAttribute('data-added-formats'),
									removedFormats: dom.getAttribute('data-removed-formats'),
								};
							}
						}
					],
					toDOM: (node)=> {
						return ['ins', {
							'data-user-id': node.attrs.userId,
							'data-edit-type': node.attrs.editType,
							'data-added-formats': node.attrs.addedFormats,
							'data-removed-formats': node.attrs.removedFormats,
						}];
					},
					toStatic: (mark, children)=> {
						return (
							<ins>
								{children}
							</ins>
						);
					}
				},
				deletion: {
					inclusive: false,
					attrs: {
						userId: { default: '' },
						editType: { default: '' },
					},
					parseDOM: [
						{
							tag: 'deletion', // This is intentionally not going to match. We don't want to allow pasting of deletions
							getAttrs: (dom)=> {
								return {
									userId: dom.getAttribute('data-user-id'),
									editType: dom.getAttribute('data-edit-type'),
								};
							}
						}
					],
					toDOM: (node)=> {
						return ['del', {
							'data-user-id': node.attrs.userId,
							'data-edit-type': node.attrs.editType,
						}];
					},
					toStatic: (mark, children)=> {
						return (
							<del>
								{children}
							</del>
						);
					}
				},
			}
		};
	};

	render() {
		return null;
	}
}

TrackChanges.propTypes = propTypes;
TrackChanges.defaultProps = defaultProps;
export default TrackChanges;
