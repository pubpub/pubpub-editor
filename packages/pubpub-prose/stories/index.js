import { action, storiesOf } from '@kadira/storybook';

import DocSingleReference from './sampledocs/singlereference';
import React from 'react';
import RichEditor from './storybookRichEditor';

console.log('Got docJSON', DocSingleReference);

storiesOf('Editor', module)
  .add('basic ', () => (
    <RichEditor/>
  ))
  .add('single reference', () => (
    <RichEditor initialState={DocSingleReference}/>
  ));
  ;
