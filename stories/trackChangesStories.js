import React, { Component } from 'react';
import { storiesOf } from '@storybook/react';
import { Editor } from 'index';
import TrackChanges from 'addons/TrackChanges/TrackChanges';
import { editorWrapperStyle } from './_utilities';
import plainDoc from './initialDocs/plainDoc';

storiesOf('TrackChanges', module)
.add('default', () => (
	<Wrapper />
));

class Wrapper extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isActive: true,
			userId: String(Math.floor(Math.random() * 50)),
		};
	}

	render() {
		return (
			<div>
				<button
					className={`pt-button ${this.state.isActive ? 'pt-intent-success' : ''}`}
					onClick={()=> {
						this.setState({ isActive: !this.state.isActive });
					}}
					style={{ marginBottom: '1em' }}
				>
					Toggle Active (currently {String(this.state.isActive)})
				</button>
				<div style={editorWrapperStyle}>
					<Editor
						placeholder="Begin writing..."
						initialContent={plainDoc}
					>
						<TrackChanges
							isActive={()=> { return this.state.isActive; }}
							userId={this.state.userId}
						/>
					</Editor>
				</div>
			</div>
		);
	}
}