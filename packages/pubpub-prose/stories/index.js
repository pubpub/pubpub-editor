import { action, storiesOf } from '@kadira/storybook';

import React from 'react';
import RichEditor from './storybookRichEditor';

storiesOf('Editor', module)
  .add('basic ', () => (
    <RichEditor/>
  ));
