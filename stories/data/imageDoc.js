const imageDoc = {
	type: 'doc',
	attrs: {
		meta: {}
	},
	content: [
		{
			type: 'paragraph',
			content: [
				{
					type: 'equation',
					attrs: {
						content: '\\sum_ix^i'
					}
				},
				{
					type: 'text',
					text: ' and hello.'
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

export default imageDoc;
