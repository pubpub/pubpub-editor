import {SingleMention, SingleReference} from './sampledocs';
import { action, storiesOf } from '@kadira/storybook';

import Autocomplete from './storybookAutocomplete';
import React from 'react';
import RichEditor from './storybookRichEditor';
import MarkdownEditor from './storybookMarkdownEditor';

storiesOf('Rich Editor', module)
	.add('basic ', () => (
		<RichEditor/>
	))
	.add('single reference', () => (
		<RichEditor initialState={SingleReference}/>
	))
	.add('single mention', () => (
		<RichEditor initialState={SingleMention}/>
	));
	;

	storiesOf('Markdown Editor', module)
	.add('basic ', () => (
		<MarkdownEditor/>
	));

	storiesOf('Autocomplete', module)
	.add('basic ', () => (
		<Autocomplete/>
	));
