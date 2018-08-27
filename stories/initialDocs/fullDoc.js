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
			type: 'highlightQuote',
			attrs: {
				prefix: 'Well then that is it. ',
				exact: 'This is my highlight.',
				suffix: ' Surely this comes after.',
				id: 'initfakeid1',
			}
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
		// {
		// 	type: 'iframe',
		// 	attrs: {
		// 		url: 'https://www.youtube.com/embed/RK1K2bCg4J8',
		// 		caption: 'Hello there!',
		// 		align: 'full',
		// 		height: 350,
		// 	},
		// },
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
			type: 'paragraph',
			content: [
				{
					type: 'text',
					text: 'Hello'
				},
				{
					text: 'And some paragraph text ',
					type: 'text'
				},
				{
					type: 'citation',
					attrs: {
						html: '<div class=\"csl-bib-body\">\n  <div data-csl-entry-id=\"turnbaugh2006obesity\" class=\"csl-entry\">Turnbaugh, P. J., Ley, R. E., Mahowald, M. A., Magrini, V., Mardis, E. R., &#38; Gordon, J. I. (2006). An obesity-associated gut microbiome with increased capacity for energy harvest. <i>Nature</i>, <i>444</i>(7122), 1027–131.</div>\n</div>',
						count: 1,
						value: '@article{turnbaugh2006obesity,\n  title={An obesity-associated gut microbiome with increased capacity for energy harvest},\n  author={Turnbaugh, Peter J and Ley, Ruth E and Mahowald, Michael A and Magrini, Vincent and Mardis, Elaine R and Gordon, Jeffrey I},\n  journal={nature},\n  volume={444},\n  number={7122},\n  pages={1027--131},\n  year={2006},\n  publisher={Nature Publishing Group}\n}'
					}
				},
				{
					type: 'text',
					text: 'Hello, how are you?'
				},
			]
		},
		{
			type: 'heading',
			attrs: {
				level: 2,
			},
			content: [
				{
					type: 'text',
					text: 'Citation List',
				}
			]
		},
		{
			type: 'citationList',
			attrs: { listItems: [] }
		},
		{
			type: 'paragraph',
			content: [
				{
					type: 'text',
					text: 'Hello'
				},
				{
					text: 'And some paragraph text ',
					type: 'text'
				},
				{
					type: 'footnote',
					attrs: {
						value: 'This here is some text!',
						count: 0,
						id: 'ah8f01je8ja7bfh1',
					},
				},
				{
					type: 'text',
					text: 'Hello, how are you?'
				},
			]
		},
		{
			type: 'footnoteList',
			attrs: { listItems: [] }
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
