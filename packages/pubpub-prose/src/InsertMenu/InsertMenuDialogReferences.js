import { Button, Dialog } from '@blueprintjs/core';
import React, { PropTypes } from 'react';

export const InsertMenuDialogReferences = React.createClass({
	propTypes: {
		onClose: PropTypes.func,
		isOpen: PropTypes.bool,
		onReferenceAdd: PropTypes.func,
	},

	getInitialState() {
		return {
			selectedTabIndex: TabIndexes.MANUAL,
			addedFields: [
				'title', 'author', 'journal', 'year',
			],
			referenceData: {
				title: '',
				url: '',
				author: '',
				journal: '',
				volume: '',
				number: '',
				pages: '',
				year: '',
				publisher: '',
				doi: '',
				note: '',
			},
			addFieldEnable: false,
			manual: {
				url: '',
				metadata: {

				},
			},
			savable: false,
		};
	},

	render() {
		return (
			<Dialog isOpen={this.props.isOpen} onClose={this.props.onClose} title={'Add References'}>
				<div className="pt-dialog-body">
					<b>References are kept in a bibtex file (references.bib) stored in your pub. Type '@' in the editor to insert references from your this file.</b>
					Click here to edit that bibtex file directly - or add new files below
				</div>
			</Dialog>
		);
 
	}
});

export default InsertMenuDialogReferences;
