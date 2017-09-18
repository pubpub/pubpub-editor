import { DiffDocs, Footnotes, HtmlDoc, PDFrendering, ReferenceOrdering, SampleMarkdown, SingleMention, SingleReference, TableMarkdown } from './sampledocs';
import { LongLegacyBug, MentionContentBug, ReferenceNotShowingBug } from './bugdata';

import CollaborativeEditor from './storybookCollaborativeEditor';
import React from 'react';
import { storiesOf } from '@kadira/storybook';

/*
storiesOf('Full Editor', module)
.add('basic ', () => (
	<FullEditor />
))
.add('table conversion ', () => (
	<FullEditor mode={'markdown'} initialContent={TableMarkdown} />
))
.add('reference serializing ', () => (
	<FullEditor mode={'rich'} initialContent={SingleReference} />
))
.add('Full Markdown Test', () => (
	<FullEditor mode={'markdown'} initialContent={SampleMarkdown} />
))
.add('Reference Ordering Test', () => (
	<FullEditor mode={'markdown'} initialContent={ReferenceOrdering} />
))
.add('Html Test', () => (
	<FullEditor mode={'markdown'} initialContent={HtmlDoc} />
))
.add('PDF rendering', () => (
	<FullEditor mode={'markdown'} initialContent={PDFrendering} />
))
.add('Footnotes', () => (
	<FullEditor mode={'markdown'} initialContent={Footnotes} />
))
.add('API Search', () => (
	<APIEditor />
))
.add('Diff Editor ', () => (
	<DiffEditor text1={DiffDocs[0]} text2={DiffDocs[1]} />
));
*/

storiesOf('Collaborative Editing', module)
.add('Forking & Rebasing', () => (
	<CollaborativeEditor clientID="test" editorKey="testDoc" collaborative={true} allowForking={true} />
))
.add('Track Changes in Forks', () => (
	<CollaborativeEditor clientID="test" editorKey="basicDoc01" collaborative={true} trackChanges={true} allowForking={false} />
))
;

/*
storiesOf('Debugging', module)
.add('mention content ', () => (
	<FullEditor mode={'markdown'} initialContent={MentionContentBug} />
))
.add('long legacy ', () => (
	<FullEditor mode={'rich'} initialContent={LongLegacyBug} />
))
.add('reference debugging ', () => (
	<FullEditor mode={'rich'} initialContent={ReferenceNotShowingBug} />
));
*/

/*
storiesOf('Converter', module)
.add('Convert to PDF ', () => (
	<Converter />
))
.add('Import to PubPub ', () => (
	<ImportConverter  />
));
*/
