const imageDoc = {
	type: 'doc',
	attrs: {
		'meta': {}
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
      type: 'image',
      attrs: {
        url: "https://i.imgur.com/4jIx7oE.gif",
        caption: "hey"
      }
    },
	]
};

export default imageDoc;
