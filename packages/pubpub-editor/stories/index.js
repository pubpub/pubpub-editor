import { ReferenceOrdering, SampleMarkdown, SingleMention, SingleReference, TableMarkdown } from './sampledocs';

import CodeEditor from './storybookCodeEditor';
import FullEditor from './storybookFullEditor';
import MarkdownEditor from './storybookMarkdownEditor';
import { MentionContentBug } from './bugdata';
import React from 'react';
import RichEditor from './storybookRichEditor';
import { storiesOf } from '@kadira/storybook';

storiesOf('Rich Editor', module)
.add('basic ', () => (
	<RichEditor />
))
.add('single reference', () => (
	<RichEditor initialState={SingleReference} />
))
.add('single mention', () => (
	<RichEditor initialState={SingleMention} />
));

storiesOf('Code Editor', module)
.add('basic ', () => (
	<CodeEditor />
));

storiesOf('Markdown Editor', module)
.add('basic ', () => (
	<MarkdownEditor />
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
;

storiesOf('Debugging', module)
.add('basic ', () => (
	<FullEditor mode={'markdown'} initialContent={MentionContentBug} />
))
;
