import { Button, Dialog, Item, Menu, MenuItem, Popover, PopoverInteractionKind, Position, Tab, TabList, TabPanel, Tabs } from '@blueprintjs/core';
import React, { PropTypes } from 'react';
import parseBibTeX from '../references/bibtextocsl';

const TabIndexes = {
	MANUAL: 0,
	BIBTEX: 1,
	URL: 2,
	EXISTING: 3,
};

export const InsertMenuDialogReferences = React.createClass({
	propTypes: {
		onClose: PropTypes.func,
		isOpen: PropTypes.bool,
		onReferenceAdd: PropTypes.func,
	},

	getInitialState() {
		return {
			// selectedTabIndex: TabIndexes.MANUAL,
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

	inputChange: function(type, evt) {
		const newReferenceData = {
			...this.state.referenceData,
			[type]: evt.target.value
		};

		this.setState({
			referenceData: newReferenceData
		});
	},

	generateBibTexString(jsonInfo) {
		// const fields = ['title', 'author', 'journal', 'volume', 'number', 'pages', 'year'];
		// const map = {
		// 	'journal_title': 'journal',
		// 	'author_instituion': 'institution',
		// };
		const jsonKeys = Object.keys(jsonInfo);
		return `
			@article{bibgen,
				${jsonKeys.map(function(key) {
					if (jsonInfo[key]) {
						return `${key}={${jsonInfo[key]}}`;
					}
					return null;
				})
				.filter(value => (!!value))
				.join(',')}
			}
		`;
	},

	addField(field) {
		const newFields = this.state.addedFields;
		newFields.push(field);
		this.setState({ addedFields: newFields });
	},

	onFieldChange() {
		this.setState({ addFieldEnable: true });
	},

	saveReference() {

		const { selectedTabIndex } = this.state;
		const citationData = {};
		let bibTexString;

		if (selectedTabIndex === TabIndexes.MANUAL) {
			/*
			for (const field of this.state.addedFields) {
				citationData[field] = this.refs[field].value;
			}
			*/
			bibTexString = this.generateBibTexString(this.state.referenceData);
		} else if (selectedTabIndex === TabIndexes.BIBTEX) {
			bibTexString = this.refs.bibtexText.value;
		}


		const cslJSON = parseBibTeX(bibTexString);


		if (cslJSON && cslJSON.length > 0 && Object.keys(cslJSON[0]).length > 0) {

			const randomCitationId = (!cslJSON.id || isNaN(cslJSON.id)) ? Math.round(Math.random()*100000000) : cslJSON.id;
			cslJSON.id = String(randomCitationId);
			this.props.onReferenceAdd(cslJSON[0]);
		}

	},

	changedTab (selectedTabIndex, prevSelectedTabIndex) {
		this.setState({ selectedTabIndex: selectedTabIndex });
	},        

	render() {
		const allFields = Object.keys(this.state.referenceData);
		const addedFields = this.state.addedFields;
		const notAdded = allFields.filter(function(index) {
			return (addedFields.indexOf(index) === -1);
		});

		const manualAddPopover = (
			<Menu>
				{notAdded.map((key, index)=> {
					return (
						<MenuItem key={key} onClick={this.addField.bind(this, key)} text={key} />
					);
				})}
			</Menu>
		);

		return (
			<Dialog isOpen={this.props.isOpen} onClose={this.props.onClose} title={'Add References'}>
				<div className="pt-dialog-body">
					<b>References are kept in a bibtex file (references.bib) stored in your pub. Type '@' in the editor to insert references from your this file.</b>
					Click here to edit that bibtex file directly - or add new files below
					
					<Tabs onChange={this.changedTab} selectedTabIndex={this.state.selectedTabIndex}>
						<TabList>
							<Tab key="manual">Manual Add</Tab>
							<Tab key="bibtex">Import from BiBTeX</Tab>

						</TabList>
					<TabPanel>
						{addedFields.map((key, index)=> {
							return (
								<div key={'refernceField-' + index}>
									<label className="pt-label" htmlFor={key}>
										{key}
										<input style={{ width: '80%' }} className="pt-input" ref={key} id={key} name={key} type="text" value={this.state.referenceData[key]} onChange={this.inputChange.bind(this, key)}/>
									</label>
								</div>
							);
						})}

						<div className="pt-input-group">

							<Popover 
								content={manualAddPopover}
								interactionKind={PopoverInteractionKind.CLICK}
								popoverClassName="pt-popover-content-sizing pt-minimal editorMenuPopover"
								position={Position.TOP}
								useSmartPositioning={false}>
								<button style={{marginLeft:0, marginTop: 10}} type="button" className="pt-button">
									<span className="pt-icon-standard pt-icon-add-to-artifact"></span>
									Add Field
									<span className="pt-icon-standard pt-icon-caret-up pt-align-right"></span>
								</button>
							</Popover>
						</div>
					</TabPanel>


					<TabPanel>
						<div className="pt-callout">
							Paste in BiBTeX data and we will automatically create a reference.
						</div>

						<textarea className="pt-input pt-fill" dir="auto" ref="bibtexText" />

					</TabPanel>

				</Tabs>


				</div>
				<div className="pt-dialog-footer">
					<div className="pt-dialog-footer-actions">
						<Button onClick={this.saveReference} text="Insert" />		
					</div>
				</div>
			</Dialog>
		);

	}
});

export default InsertMenuDialogReferences;
