const fileDoc = {
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
						value: '\\sum_ix^i'
					}
				},
				{
					type: 'text',
					text: ' and hello.'
				}
			]
		},
		{
			type: 'file',
			attrs: {
				url: 'https://i.imgur.com/4jIx7oE.gif',
				fileName: 'myGreatFile.gif',
				fileSize: '29kb',
				caption: 'Hello there!',
			},
		},
	]
};

export default fileDoc;
