const doc = {
	type: 'doc',
	attrs: {
		meta: {},
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
				},
			],
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
				},
				{
					type: 'equation',
					attrs: {
						value: '\\sum_ix^i',
						html:
							'<span class="katex"><span class="katex-mathml"><math><semantics><mrow><msub><mo>∑</mo><mi>i</mi></msub><msup><mi>x</mi><mi>i</mi></msup></mrow><annotation encoding="application/x-tex">sum_ix^i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="strut" style="height:0.824664em;"></span><span class="strut bottom" style="height:1.124374em;vertical-align:-0.29971000000000003em;"></span><span class="base"><span class="mop"><span class="mop op-symbol small-op" style="position:relative;top:-0.0000050000000000050004em;">∑</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.16195399999999993em;"><span style="top:-2.40029em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathit mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.29971000000000003em;"></span></span></span></span></span><span class="mord"><span class="mord mathit">x</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.824664em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathit mtight">i</span></span></span></span></span></span></span></span></span></span></span>',
					},
				},
			],
		},
		{
			type: 'image',
			attrs: {
				url: 'https://assets.pubpub.org/_testing/41517872250621.png',
				caption: 'Hello there!',
			},
		},
		{
			type: 'block_equation',
			attrs: {
				value: '\\sum_ix^i',
				html:
					'<span class="katex"><span class="katex-mathml"><math><semantics><mrow><msub><mo>∑</mo><mi>i</mi></msub><msup><mi>x</mi><mi>i</mi></msup></mrow><annotation encoding="application/x-tex">sum_ix^i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="strut" style="height:0.824664em;"></span><span class="strut bottom" style="height:1.124374em;vertical-align:-0.29971000000000003em;"></span><span class="base"><span class="mop"><span class="mop op-symbol small-op" style="position:relative;top:-0.0000050000000000050004em;">∑</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.16195399999999993em;"><span style="top:-2.40029em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathit mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.29971000000000003em;"></span></span></span></span></span><span class="mord"><span class="mord mathit">x</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.824664em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathit mtight">i</span></span></span></span></span></span></span></span></span></span></span>',
			},
		},
		{
			type: 'highlightQuote',
			attrs: {
				prefix: 'Well then that is it. ',
				exact: 'This is my highlight.',
				suffix: ' Surely this comes after.',
				id: 'initfakeid1',
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
				},
			],
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
				},
			],
		},
		{
			type: 'video',
			attrs: {
				url: 'http://techslides.com/demos/sample-videos/small.mp4',
				caption: 'Most videos are <b>colorful</b> - but some are black and white.',
			},
		},
		{
			type: 'audio',
			attrs: {
				url: 'http://www.noiseaddicts.com/samples_1w72b820/3819.mp3',
				caption: 'A more perfect union',
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
					text: 'Hello',
				},
				{
					text: 'And some paragraph text ',
					type: 'text',
				},
				{
					type: 'citation',
					attrs: {
						html:
							'<div class="csl-bib-body">\n  <div data-csl-entry-id="turnbaugh2006obesity" class="csl-entry">Turnbaugh, P. J., Ley, R. E., Mahowald, M. A., Magrini, V., Mardis, E. R., &#38; Gordon, J. I. (2006). An obesity-associated gut microbiome with increased capacity for energy harvest. <i>Nature</i>, <i>444</i>(7122), 1027–131.</div>\n</div>',
						count: 1,
						value:
							'@article{turnbaugh2006obesity,\n  title={An obesity-associated gut microbiome with increased capacity for energy harvest},\n  author={Turnbaugh, Peter J and Ley, Ruth E and Mahowald, Michael A and Magrini, Vincent and Mardis, Elaine R and Gordon, Jeffrey I},\n  journal={nature},\n  volume={444},\n  number={7122},\n  pages={1027--131},\n  year={2006},\n  publisher={Nature Publishing Group}\n}',
					},
				},
				{
					type: 'citation',
					attrs: {
						html:
							'<div class="csl-bib-body">\n  <div data-csl-entry-id="turnbaugh2006obesity" class="csl-entry">Turnbaugh, P. J., Ley, R. E., Mahowald, M. A., Magrini, V., Mardis, E. R., &#38; Gordon, J. I. (2006). An obesity-associated gut microbiome with increased capacity for energy harvest. <i>Nature</i>, <i>444</i>(7122), 1027–131.</div>\n</div>',
						count: 1,
						unstructuredValue: '<b>cat</b>',
						value:
							'@article{turnbaugh2006obesity,\n  title={An obesity-associated gut microbiome with increased capacity for energy harvest},\n  author={Turnbaugh, Peter J and Ley, Ruth E and Mahowald, Michael A and Magrini, Vincent and Mardis, Elaine R and Gordon, Jeffrey I},\n  journal={nature},\n  volume={444},\n  number={7122},\n  pages={1027--131},\n  year={2006},\n  publisher={Nature Publishing Group}\n}',
					},
				},
				{
					type: 'text',
					text: 'Hello, how are you?',
				},
			],
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
				},
			],
		},
		{
			type: 'citationList',
			attrs: { listItems: [] },
		},
		{
			type: 'paragraph',
			content: [
				{
					type: 'text',
					text: 'Hello',
				},
				{
					text: 'And some paragraph text ',
					type: 'text',
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
					type: 'footnote',
					attrs: {
						value: 'This here is some text!',
						count: 0,
						structuredValue: 'fish',
						structuredHtml: '<b>Fish</b>',
						id: 'ah8f01je8ja7bfh1',
					},
				},
				{
					type: 'text',
					text: 'Hello, how are you?',
				},
			],
		},
		{
			type: 'footnoteList',
			attrs: { listItems: [] },
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
								colwidth: [78],
								background: null,
							},
							content: [
								{
									type: 'paragraph',
									attrs: {
										class: null,
									},
									content: [
										{
											type: 'text',
											text: 'Info',
										},
									],
								},
							],
						},
						{
							type: 'table_header',
							attrs: {
								colspan: 1,
								rowspan: 1,
								colwidth: null,
								background: null,
							},
							content: [
								{
									type: 'paragraph',
									attrs: {
										class: null,
									},
									content: [
										{
											type: 'text',
											text: 'Contact',
										},
									],
								},
							],
						},
						{
							type: 'table_header',
							attrs: {
								colspan: 1,
								rowspan: 1,
								colwidth: null,
								background: null,
							},
							content: [
								{
									type: 'paragraph',
									attrs: {
										class: null,
									},
									content: [
										{
											type: 'text',
											text: 'Country',
										},
									],
								},
							],
						},
					],
				},
				{
					type: 'table_row',
					content: [
						{
							type: 'table_cell',
							attrs: {
								colspan: 1,
								rowspan: 1,
								colwidth: [78],
								background: null,
							},
							content: [
								{
									type: 'paragraph',
									attrs: {
										class: null,
									},
									content: [
										{
											type: 'text',
											text: 'Alfreds Futterkiste',
										},
									],
								},
							],
						},
						{
							type: 'table_cell',
							attrs: {
								colspan: 1,
								rowspan: 1,
								colwidth: null,
								background: null,
							},
							content: [
								{
									type: 'paragraph',
									attrs: {
										class: null,
									},
									content: [
										{
											type: 'text',
											text: 'Maria Anders',
										},
									],
								},
							],
						},
						{
							type: 'table_cell',
							attrs: {
								colspan: 1,
								rowspan: 1,
								colwidth: null,
								background: null,
							},
							content: [
								{
									type: 'paragraph',
									attrs: {
										class: null,
									},
									content: [
										{
											type: 'text',
											text: 'Germany',
										},
									],
								},
							],
						},
					],
				},
				{
					type: 'table_row',
					content: [
						{
							type: 'table_cell',
							attrs: {
								colspan: 1,
								rowspan: 1,
								colwidth: [78],
								background: null,
							},
							content: [
								{
									type: 'paragraph',
									attrs: {
										class: null,
									},
									content: [
										{
											type: 'text',
											text: 'Centro comercial Moctezuma',
										},
									],
								},
							],
						},
						{
							type: 'table_cell',
							attrs: {
								colspan: 1,
								rowspan: 1,
								colwidth: null,
								background: null,
							},
							content: [
								{
									type: 'paragraph',
									attrs: {
										class: null,
									},
									content: [
										{
											type: 'text',
											text: 'Francisco Chang',
										},
									],
								},
							],
						},
						{
							type: 'table_cell',
							attrs: {
								colspan: 1,
								rowspan: 1,
								colwidth: null,
								background: null,
							},
							content: [
								{
									type: 'paragraph',
									attrs: {
										class: null,
									},
									content: [
										{
											type: 'text',
											text: 'Mexico',
										},
									],
								},
							],
						},
					],
				},
			],
		},
	],
};

export default doc;
