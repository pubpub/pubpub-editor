const doc = {
	type: 'doc',
	attrs: {
		meta: {}
	},
	content: [
		{
			type: 'paragraph',
			content: [
				{
					type: 'text',
					text: ' and hello.'
				}
			]
		},
		{
			type: 'github',
			attrs: {
				url: 'https://github.com/pubpub/pubpub-editor'
			},
		},
		{
			type: 'paragraph',
			content: [
				{
					type: 'text',
					text: ' and goodby!.'
				}
			]
		}
	]
};

export default doc;
