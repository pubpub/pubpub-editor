import { action, storiesOf } from '@kadira/storybook';

import React from 'react';
import RichEditor from '../src/react/reactRichEditor';

require("../style/base.scss");
// require("../style/blueprint.scss");

storiesOf('Button', module)
  .add('with text', () => (
    <button onClick={action('clicked')}>Hello Button</button>
  ))
  .add('with some emoji', () => (
    <button onClick={action('clicked')}>😀 😎 👍 💯</button>
  ));


storiesOf('Editor', module)
  .add('basic ', () => (
    <RichEditor/>
  ));
