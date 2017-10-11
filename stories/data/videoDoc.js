const videoDoc = {
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
			type: 'video',
			attrs: {
				url: 'http://techslides.com/demos/sample-videos/small.mp4',
				caption: 'Hello there!',
			},
		},
	]
};

export default videoDoc;
