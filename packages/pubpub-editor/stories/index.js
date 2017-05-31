import { Footnotes, HtmlDoc, PDFrendering, ReferenceOrdering, SampleMarkdown, SingleMention, SingleReference, TableMarkdown } from './sampledocs';
import { LongLegacyBug, MentionContentBug, ReferenceNotShowingBug } from './bugdata';

import APIEditor from './storybookAPI';
import CodeEditor from './storybookCodeEditor';
import Converter from './storybookConverter';
import DisplayEditor from './storybookDisplayEditor';
import ExportMenu from './storybookExportMenu';
import FullEditor from './storybookFullEditor';
import ImportConverter from './storybookImportConverter';
import MarkdownEditor from './storybookMarkdownEditor';
import React from 'react';
import RichEditor from './storybookRichEditor';
import { storiesOf } from '@kadira/storybook';

storiesOf('Code Editor', module)
.add('basic ', () => (
	<CodeEditor />
));

storiesOf('Display Editor', module)
.add('basic ', () => (
	<DisplayEditor />
));

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
;

storiesOf('Subcomponents', module)
.add('Export Menu', () => (
	<ExportMenu/>
))
;

storiesOf('Debugging', module)
.add('mention content ', () => (
	<FullEditor mode={'markdown'} initialContent={MentionContentBug} />
))
.add('long legacy ', () => (
	<FullEditor mode={'rich'} initialContent={LongLegacyBug} />
))
.add('reference debugging ', () => (
	<FullEditor mode={'rich'} initialContent={ReferenceNotShowingBug} />
))
;


storiesOf('Converter', module)
.add('Convert to PDF ', () => (
	<Converter />
))
.add('Import to PubPub ', () => (
	<ImportConverter  />
))
// .add('Convert to Ppub', () => (
// 	<Converter mode={'rich'} initialContent={LongLegacyBug} />
// ))
;
