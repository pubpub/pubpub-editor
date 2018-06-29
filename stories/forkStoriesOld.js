import React, { Component } from 'react';
import { storiesOf } from '@storybook/react';
import { Editor } from 'index';
import FormattingMenu from 'addons/FormattingMenu/FormattingMenu';
import Collaborative from 'addons/Collaborative/Collaborative';
import TrackChanges from 'addons/TrackChanges/TrackChangesAddon';
import Latex from 'addons/Latex/Latex';
import Image from 'addons/Image/Image';
import InsertMenu from 'addons/InsertMenu/InsertMenu';
import { editorWrapperStyle, s3Upload, renderLatex, firebaseConfig, clientData } from './_utilities';

class ForkStory extends Component {
	constructor(props) {
		super(props);
		this.state = {
			rootKey: 'storybook-track-fork-v3',
			editorKey: 'storybook-track-fork-v3',
			inFork: false,
			forks: [],
		};
		this.fork = this.fork.bind(this);
		this.updateForks = this.updateForks.bind(this);
		this.joinFork = this.joinFork.bind(this);
	}

	fork() {
		const { inFork } = this.state;
		if (!inFork) {
			this.collab.fork().then((forkName) => {
				this.setState({ editorKey: forkName, inFork: true });
			});
		} else {
			this.setState({ editorKey: this.state.rootKey, inFork: false });
		}
	}

	updateForks(forks) {
		this.setState({ forks });
	}

	joinFork(fork) {
		this.setState({ editorKey: fork.name, inFork: true });
	}

	render() {
		const { editorKey, inFork, forks } = this.state;
		return (
			<div style={editorWrapperStyle}>
				<button onClick={this.fork}>
					{!inFork ? 'Fork' : 'Back' }
				</button>
				{forks.map((fork) => {
					return (
						<button onClick={()=> { this.joinFork(fork); }}>
							{fork.name}
						</button>
					);
				})}

				<Editor key={editorKey}>
					<FormattingMenu />
					<InsertMenu />
					{inFork
						? <TrackChanges />
						: null
					}
					<Latex renderFunction={renderLatex} />
					<Image handleFileUpload={s3Upload} />
					<Collaborative
						ref={(collab) => { this.collab = collab; }}
						onForksUpdate={this.updateForks}
						firebaseConfig={firebaseConfig}
						clientData={clientData}
						editorKey={editorKey}
					/>
				</Editor>
			</div>
		);
	}
}

storiesOf('Fork', module)
.add('default', () => (
	<ForkStory />
));
