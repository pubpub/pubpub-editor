const iframeDoc = {
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
			type: 'iframe',
			attrs: {
				url: 'https://www.youtube.com/embed/VHG7mHKwQqA',
				caption: 'Hello there!',
			},
		},
	]
};

export default iframeDoc;
