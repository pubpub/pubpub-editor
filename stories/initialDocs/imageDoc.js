const doc = {
	type: 'doc',
	attrs: {
		meta: {}
	},
	content: [
		{
			type: 'paragraph',
			content: [
				// {
				// 	type: 'equation',
				// 	attrs: {
				// 		value: '\\sum_ix^i'
				// 	}
				// },
				{
					type: 'text',
					text: ' and hello.',
					marks: [{ type: 'strong' }],
				}
			]
		},
		{
			type: 'image',
			attrs: {
				url: 'https://i.imgur.com/4jIx7oE.gif',
				caption: 'Hello there!',
			},
		},
	]
};

export default doc;
