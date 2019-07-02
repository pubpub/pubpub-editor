import React from 'react';
import Latex from '../components/Latex/Latex';

export default {
	equation: {
		atom: true,
		attrs: {
			value: { default: '' },
			html: { default: '' },
		},
		parseDOM: [
			{
				tag: 'math-inline',
				getAttrs: (node) => {
					return {
						value: node.getAttribute('data-value') || '',
						html: node.getAttribute('data-html') || '',
					};
				},
			},
		],
		toDOM: (node) => {
			// return [
			// 	'math-inline',
			// 	{
			// 		'data-value': node.attrs.value,
			// 		'data-html': node.attrs.html,
			// 	},
			// ];
			console.log('equation node', node);
			const thing = node.attrs.key ? (
				<span dangerouslySetInnerHTML={{ __html: node.attrs.html }} />
			) : (
				document.createElement('span')
			);
			if (!node.attrs.key) {
				thing.innerHTML = node.attrs.html;
			}
			return thing;
			return [
				'math-inline',
				{
					class: 'latex-wrapper',
					'data-type': 'math-inline',
					'data-value': node.attrs.value,
					'data-html': node.attrs.html,
				},
				thing,
			];
		},
		inline: true,
		group: 'inline',
		draggable: false,

		/* NodeView Options. These are not part of the standard Prosemirror Schema spec */
		// isNodeView: true,
		onInsert: (view) => {
			const equationNode = view.state.schema.nodes.equation.create({
				value: '\\sum_ix^i',
				html:
					'<span class="katex"><span class="katex-mathml"><math><semantics><mrow><msub><mo>∑</mo><mi>i</mi></msub><msup><mi>x</mi><mi>i</mi></msup></mrow><annotation encoding="application/x-tex">sum_ix^i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="strut" style="height:0.824664em;"></span><span class="strut bottom" style="height:1.124374em;vertical-align:-0.29971000000000003em;"></span><span class="base"><span class="mop"><span class="mop op-symbol small-op" style="position:relative;top:-0.0000050000000000050004em;">∑</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.16195399999999993em;"><span style="top:-2.40029em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathit mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.29971000000000003em;"></span></span></span></span></span><span class="mord"><span class="mord mathit">x</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.824664em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathit mtight">i</span></span></span></span></span></span></span></span></span></span></span>',
			});
			const transaction = view.state.tr.replaceSelectionWith(equationNode);
			view.dispatch(transaction);
		},
		defaultOptions: {},
		toStatic: (node, options, isSelected, isEditable /* editorProps, children */) => {
			return (
				<Latex
					key={node.currIndex}
					attrs={node.attrs}
					options={options}
					isSelected={isSelected}
					isEditable={isEditable}
				/>
			);
		},
	},
	block_equation: {
		atom: true,
		attrs: {
			value: { default: '' },
			html: { default: '' },
		},
		parseDOM: [
			{
				tag: 'math-block',
				getAttrs: (node) => {
					return {
						value: node.getAttribute('data-value') || '',
						html: node.getAttribute('data-html') || '',
					};
				},
			},
		],
		toDOM: (node) => {
			return [
				'math-block',
				{
					'data-value': node.attrs.value,
					'data-html': node.attrs.html,
				},
			];
		},
		inline: false,
		group: 'block',
		draggable: false,

		/* NodeView Options. These are not part of the standard Prosemirror Schema spec */
		isNodeView: true,
		onInsert: (view) => {
			const equationNode = view.state.schema.nodes.block_equation.create({
				value: '\\sum_ix^i',
				html:
					'<span class="katex"><span class="katex-mathml"><math><semantics><mrow><msub><mo>∑</mo><mi>i</mi></msub><msup><mi>x</mi><mi>i</mi></msup></mrow><annotation encoding="application/x-tex">sum_ix^i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="strut" style="height:0.824664em;"></span><span class="strut bottom" style="height:1.124374em;vertical-align:-0.29971000000000003em;"></span><span class="base"><span class="mop"><span class="mop op-symbol small-op" style="position:relative;top:-0.0000050000000000050004em;">∑</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.16195399999999993em;"><span style="top:-2.40029em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathit mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.29971000000000003em;"></span></span></span></span></span><span class="mord"><span class="mord mathit">x</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.824664em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathit mtight">i</span></span></span></span></span></span></span></span></span></span></span>',
			});
			const transaction = view.state.tr.replaceSelectionWith(equationNode);
			view.dispatch(transaction);
		},
		defaultOptions: {},
		toStatic: (node, options, isSelected, isEditable /* editorProps, children */) => {
			return (
				<Latex
					key={node.currIndex}
					attrs={node.attrs}
					options={options}
					isSelected={isSelected}
					isEditable={isEditable}
				/>
			);
		},
	},
};
