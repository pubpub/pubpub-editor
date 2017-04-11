import { Button, Dialog, Item, Menu, MenuItem, Popover, PopoverInteractionKind, Position, Tab, TabList, TabPanel, Tabs } from '@blueprintjs/core';
import React, {PropTypes} from 'react';

import parseBibTeX from '../references/bibtextocsl';
import request from 'superagent';

let styles = {};

const TabIndexes = {
	MANUAL: 0,
	BIBTEX: 1,
	URL: 2,
	EXISTING: 3,
};

export const ReferenceDialog = React.createClass({
	propTypes: {
		value: PropTypes.string,
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

	inputChange: function(type, evt) {
		const newReferenceData = {
			...this.state.referenceData,
			[type]: evt.target.value
		};

		this.setState({
			referenceData: newReferenceData
		});
	},


	getMetaData: function() {

		const url = this.refs.manualurl.value;

		request
	  .post('/api/getReferenceFromURL')
	  .send({ url })
	  .end((err, res) => {
			const urlMetaData = JSON.parse(res.text);
			console.log(urlMetaData);
			this.setState({ referenceData: urlMetaData, selectedTabIndex: TabIndexes.MANUAL });
	  });
	},


	mapMetaData: function() {

	},

	handleKeyPress: function(e) {
		 if (e.key === 'Enter') {
			 this.getMetaData();
		 }
	},

	/*

	@article{garcia2003genome,
  title={The genome sequence of Yersinia pestis bacteriophage $\varphi$A1122 reveals an intimate history with the coliphage T3 and T7 genomes},
  author={Garcia, Emilio and Elliott, Jeffrey M and Ramanculov, Erlan and Chain, Patrick SG and Chu, May C and Molineux, Ian J},
  journal={Journal of bacteriology},
  volume={185},
  number={17},
  pages={5248--5262},
  year={2003},
  publisher={Am Soc Microbiol}
	}
	*/

	generateBibTexString(jsonInfo) {
		const fields = ['title', 'author', 'journal', 'volume', 'number', 'pages', 'year'];
		const map = {
			'journal_title': 'journal',
			'author_instituion': 'institution',
		};
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
		`
	},

	addField(field) {
		const newFields = this.state.addedFields;
		newFields.push(field);
		this.setState({addedFields: newFields});
	},

	onFieldChange() {
		this.setState({addFieldEnable: true});
	},

	saveReference() {

		const {selectedTabIndex} = this.state;
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
			this.props.saveReference(cslJSON[0]);
		}

	},

	changedTab (selectedTabIndex, prevSelectedTabIndex) {
		this.setState({ selectedTabIndex: selectedTabIndex });
	},

	preventClick: function(evt) {
		evt.preventDefault();
	},

  render() {
    const {open} = this.props;

 		const allFields = Object.keys(this.state.referenceData);
		const addedFields = this.state.addedFields;
		const notAdded = allFields.filter(function(n) {
		    return (addedFields.indexOf(n) === -1);
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
      <div onClick={this.preventClick}>
        <Dialog
            iconName="inbox"
            isOpen={open}
            onClose={this.props.onClose}
            title="Add Reference"
        >
            <div className="pt-dialog-body">


							<Tabs onChange={this.changedTab} selectedTabIndex={this.state.selectedTabIndex}>
							    <TabList>
											<Tab key="manual">Manual Add</Tab>
											<Tab key="bibtex">Import from BiBTeX</Tab>
											{/*
							        <Tab key="url">Add by URL</Tab>
											<Tab key="existing">From Existing</Tab>
											*/}
							    </TabList>
							    <TabPanel>
										{addedFields.map((key, index)=> {
											return (
												<div key={'refernceField-' + index}>
													<label className="pt-label"  htmlFor={key}>
														{key}
													</label>
													<input style={{width: '80%'}} className="pt-input" ref={key} id={key} name={key} type="text" value={this.state.referenceData[key]} onChange={this.inputChange.bind(this, key)}/>
												</div>
											);
										})}

										<div className="pt-input-group">

											<Popover content={manualAddPopover}
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

										<textarea className="pt-input pt-fill" dir="auto" ref="bibtexText"></textarea>

									</TabPanel>

									{/*

							    <TabPanel>

										<div className="pt-callout">
										  You can paste in links to scholarly articles (particularly those from Google Scholar) to automatically get their citation data.
										</div>

										<label className="pt-label">
										  <div className="pt-input-group">
										    <span className="pt-icon pt-icon-link"></span>
										    <input
													ref={'manualurl'}
													className="pt-input"
													type="text"
													placeholder="URL"
													dir="auto"
													onKeyPress={this.handleKeyPress}
													/>
										  </div>
										</label>
							    </TabPanel>
									<TabPanel>
									</TabPanel>
									*/}

							</Tabs>


            </div>
            <div className="pt-dialog-footer">
                <div className="pt-dialog-footer-actions">
									{(this.state.selectedTabIndex !== TabIndexes.URL) ?
										<Button intent={'yes'} onClick={this.saveReference} text="Insert" />
										:
										<Button intent={'yes'} onClick={this.getMetaData} text="Get Citation" />
									}
                </div>
            </div>
        </Dialog>
      </div>
    );
  },
});

export default ReferenceDialog;
