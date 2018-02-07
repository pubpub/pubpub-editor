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
			type: 'heading',
			attrs: {
				level: 1,
			},
			content: [
				{
					type: 'text',
					text: 'Introduction',
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
		{
			type: 'heading',
			attrs: {
				level: 2,
			},
			content: [
				{
					type: 'text',
					text: 'Whatever',
				}
			]
		},
		{
			type: 'heading',
			attrs: {
				level: 3,
			},
			content: [
				{
					type: 'text',
					text: 'Okay now',
				}
			]
		},
	]
};

export default doc;
