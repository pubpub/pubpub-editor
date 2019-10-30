import { configure } from '@storybook/react';
import { withOptions } from '@storybook/addon-options';

/* Require stories */
const req = require.context('../stories/', true, /Stories\.js$/);
function loadStories() {
	req.keys().forEach(req);
}
/* Set Storybook options */
withOptions({
	showPanel: false,
});

configure(loadStories, module);

/* Require default styles */
require('./styles.scss');
