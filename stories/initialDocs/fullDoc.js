const doc = {
	type: 'doc',
	attrs: {
		meta: {}
	},
	content: [
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
			type: 'paragraph',
			content: [
				{
					type: 'text',
					text: 'Welcome to my introduction!',
				},
				{
					type: 'text',
					text: 'This section is bold and I think that is pretty nifty.',
					marks: [{ type: 'strong' }],
				}
			]
		},
		{
			type: 'image',
			attrs: {
				url: 'https://assets.pubpub.org/_testing/41517872250621.png',
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
					text: 'Video Section',
				}
			]
		},
		{
			type: 'video',
			attrs: {
				url: 'http://techslides.com/demos/sample-videos/small.mp4',
				caption: 'Most videos are colorful - but some are black and white.',
			},
		},
		{
			type: 'iframe',
			attrs: {
				url: 'https://www.youtube.com/embed/RK1K2bCg4J8',
				caption: 'Hello there!',
				align: 'full',
				height: 350,
			},
		},
		{
			type: 'file',
			attrs: {
				url: 'https://assets.pubpub.org/_testing/41517872250621.png',
				fileName: 'myGreatFile.zip',
				fileSize: '29kb',
				caption: 'Super duper volcano expert opinion.',
			},
		},
		{
			type: 'table',
			content: [
				{
					type: 'table_row',
					content: [
						{
							type: 'table_header',
							attrs: {
								colspan: 1,
								rowspan: 1,
								colwidth: null,
								background: null
							},
							content: [
								{
									type: 'paragraph',
									attrs: {
										class: null
									},
									content: [
										{
											type: 'text',
											text: 'Info'
										}
									]
								}
							]
						},
						{
							type: 'table_header',
							attrs: {
								colspan: 1,
								rowspan: 1,
								colwidth: null,
								background: null
							},
							content: [
								{
									type: 'paragraph',
									attrs: {
										class: null
									},
									content: [
										{
											type: 'text',
											text: 'Contact'
										}
									]
								}
							]
						},
						{
							type: 'table_header',
							attrs: {
								colspan: 1,
								rowspan: 1,
								colwidth: null,
								background: null
							},
							content: [
								{
									type: 'paragraph',
									attrs: {
										class: null
									},
									content: [
										{
											type: 'text',
											text: 'Country'
										}
									]
								}
							]
						}
					]
				},
				{
					type: 'table_row',
					content: [
						{
							type: 'table_cell',
							attrs: {
								colspan: 1,
								rowspan: 1,
								colwidth: null,
								background: null
							},
							content: [
								{
									type: 'paragraph',
									attrs: {
										class: null
									},
									content: [
										{
											type: 'text',
											text: 'Alfreds Futterkiste'
										}
									]
								}
							]
						},
						{
							type: 'table_cell',
							attrs: {
								colspan: 1,
								rowspan: 1,
								colwidth: null,
								background: null
							},
							content: [
								{
									type: 'paragraph',
									attrs: {
										class: null
									},
									content: [
										{
											type: 'text',
											text: 'Maria Anders'
										}
									]
								}
							]
						},
						{
							type: 'table_cell',
							attrs: {
								colspan: 1,
								rowspan: 1,
								colwidth: null,
								background: null
							},
							content: [
								{
									type: 'paragraph',
									attrs: {
										class: null
									},
									content: [
										{
											type: 'text',
											text: 'Germany'
										}
									]
								}
							]
						}
					]
				},
				{
					type: 'table_row',
					content: [
						{
							type: 'table_cell',
							attrs: {
								colspan: 1,
								rowspan: 1,
								colwidth: null,
								background: null
							},
							content: [
								{
									type: 'paragraph',
									attrs: {
										class: null
									},
									content: [
										{
											type: 'text',
											text: 'Centro comercial Moctezuma'
										}
									]
								}
							]
						},
						{
							type: 'table_cell',
							attrs: {
								colspan: 1,
								rowspan: 1,
								colwidth: null,
								background: null
							},
							content: [
								{
									type: 'paragraph',
									attrs: {
										class: null
									},
									content: [
										{
											type: 'text',
											text: 'Francisco Chang'
										}
									]
								}
							]
						},
						{
							type: 'table_cell',
							attrs: {
								colspan: 1,
								rowspan: 1,
								colwidth: null,
								background: null
							},
							content: [
								{
									type: 'paragraph',
									attrs: {
										class: null
									},
									content: [
										{
											type: 'text',
											text: 'Mexico'
										}
									]
								}
							]
						}
					]
				}
			]
		},
	]
};

export default doc;
