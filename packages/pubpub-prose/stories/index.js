import React from 'react';
import { storiesOf } from '@kadira/storybook';

import RichEditor from './storybookRichEditor';
import MarkdownEditor from './storybookMarkdownEditor';
import FullEditor from './storybookFullEditor';
import { SingleMention, SingleReference } from './sampledocs';

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
));
