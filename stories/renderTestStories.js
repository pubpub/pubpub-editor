/* eslint-disable no-console */
/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import beautify from 'js-beautify';
import Diff from 'react-stylable-diff';
import Editor from '../src/index';
import testDocs from './initialDocs/renderTestDocs';

require('./renderTest.scss');

const RenderTest = (props) => {
	const [clientHtml, setClientHtml] = useState('');
	const [serverHtml, setServerHtml] = useState('');
	const beautifyOptions = {
		inline: [],
	};

	return (
		<div className="render-test">
			<h1>{props.title}</h1>
			<div className="grid">
				<div className="editor client">
					<Editor
						initialContent={props.doc}
						isReadOnly={false}
						onChange={(eco) => {
							setClientHtml(beautify.html(eco.view.dom.innerHTML, beautifyOptions));
						}}
					/>
				</div>
				<div className="editor server">
					<Editor
						initialContent={props.doc}
						isReadOnly={false}
						isServer={true}
						onChange={(html) => {
							setServerHtml(beautify.html(html, beautifyOptions));
						}}
					/>
				</div>
			</div>
			<div className="html">
				<Diff inputA={clientHtml} inputB={serverHtml} type="chars" />
			</div>
		</div>
	);
};

storiesOf('RenderTest', module).add('default', () => (
	<React.Fragment>
		{Object.keys(testDocs).map((key) => {
			return <RenderTest key={key} title={key} doc={testDocs[key]} />;
		})}
	</React.Fragment>
));
