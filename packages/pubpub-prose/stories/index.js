import React from 'react';
import { storiesOf } from '@kadira/storybook';

import FullEditor from './storybookFullEditor';
import MarkdownEditor from './storybookMarkdownEditor';
import RichEditor from './storybookRichEditor';
import { SingleMention, SingleReference, TableMarkdown } from './sampledocs';


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
));
