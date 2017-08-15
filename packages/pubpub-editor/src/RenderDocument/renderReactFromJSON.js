import { CitationsRender, EmbedRender, FootnoteRender, HtmlRender, IframeRender, LatexRender, MentionRender, ReferenceRender } from './renderComponents';

import { CitationEngine } from '../references';
import React from 'react';
import { findNodesWithIndex } from '../utils/doc-operations';

/*
CSL engine API endpoint...
- serialize each reference decorations?
*/


const findInlineCitationData = (doc) => {
	if (doc.content[1] && doc.content[1].type === 'citations') {
		const citationNodes = doc.content[1].content;
		if (!citationNodes || citationNodes.length === 0) {
			return [];
		}
		const citationData = citationNodes.map((node) => {
			return (node.attrs && node.attrs.data && node.attrs.data.id) ? node.attrs.data : null;
		}).filter((citationNode) => {
			return (!!citationNode);
		});
		return citationData;
	}
	return [];
}


export const renderReactFromJSON = function(doc, fileMap, allReferences, slug) {

	const engine = new CitationEngine();
	const inlineCitations = findInlineCitationData(doc);
	const finalReferences = allReferences.concat(inlineCitations);
	engine.setBibliography(finalReferences);

	const docAttrs = (doc.attrs && doc.attrs.meta) ? doc.attrs.meta : null;

	const citationsInDoc = [];

	const meta = {fileMap, allReferences, engine, docAttrs, citationsInDoc, slug, footnoteCount: 0, diffType: null};


	const content = renderSubLoop(doc.content, meta);
	return (
		<div>
			{content}
		</div>
	);
}


const renderSubLoop = function(item, meta) {
	if (!item) {return null;}

	const content = item.map((node, index)=>{
		switch (node.type) {
		case 'heading':
			if (!node.content) { return null; }
			const id = node.content[0] && node.content[0].text && node.content[0].text.trim().replace(/[^A-Za-z0-9 ]/g, '').replace(/\s/g, '-').toLowerCase();
			return React.createElement('h' + node.attrs.level, {key: index, id: id}, renderSubLoop(node.content, meta));
		case 'blockquote':
			return <blockquote key={index}>{renderSubLoop(node.content, meta)}</blockquote>;
		case 'ordered_list':
			return <ol start={node.attrs.order === 1 ? null : node.attrs.oder} key={index}>{renderSubLoop(node.content, meta)}</ol>;
		case 'bullet_list':
			return <ul key={index}>{renderSubLoop(node.content, meta)}</ul>;
		case 'list_item':
			return <li key={index}>{renderSubLoop(node.content, meta)}</li>;
		case 'horizontal_rule':
			return <hr key={index}/>;
		case 'code_block':
			return <pre key={index}><code>{renderSubLoop(node.content, meta)}</code></pre>;
		case 'paragraph':
			// console.log((node.content));
			return <div style={style} className={'p-block'} key={index}>{renderSubLoop(node.content, meta)}</div>;
		case 'page_break':
			return <div className={'pagebreak'} key={index}></div>;
		case 'image':
			return <img {...node.attrs} key={index}/>;
		case 'hard_break':
			return <br key={index}/>;
		case 'emoji':
			return node.attrs.content;
		case 'text':
			const marks = node.marks || [];
			const style = {};
			if (meta.diffType === 'plus') {
				style.backgroundColor = 'green';
			} else if (meta.diffType === 'minus') {
				style.backgroundColor = 'red';
			}

			return marks.reduce((previous, current)=>{
				switch (current.type) {
				case 'strong':
					return <strong key={index}>{previous}</strong>;
				case 'em':
					return <em key={index}>{previous}</em>;
				case 'code':
					return <code key={index}>{previous}</code>;
				case 'sub':
					return <sub key={index}>{previous}</sub>;
				case 'sup':
					return <sup key={index}>{previous}</sup>;
				case 's':
				case 'strike':
					return <s key={index}>{previous}</s>;
				case 'diff_plus':
					return <span data-commit={current.attrs.commitID} className="diff-marker added" >{previous}</span>;
				case 'diff_minus':
					console.log(current.attrs.commitID);
					return <span data-commit={current.attrs.commitID} className="diff-marker removed" >{previous}</span>;
				case 'link':
					if (current.attrs) {
						return <a href={current.attrs.href} title={current.attrs.title} key={index} target={'_top'}>{previous}</a>;
					}
					return previous;
				default:
					return previous;
				}
			}, <span style={style}>{node.text}</span>);

		case 'table':
			return <table key={index}><tbody>{renderSubLoop(node.content, meta)}</tbody></table>;
		case 'table_row':
			return <tr>{renderSubLoop(node.content, meta)}</tr>;
		case 'table_cell':
			return <td>{renderSubLoop(node.content, meta)}</td>;
		case 'embed':
			const filename = node.attrs.filename;
			const url = meta.fileMap[filename];
			return <EmbedRender key={index} {...node.attrs} url={url}>{renderSubLoop(node.content, meta)}</EmbedRender>
    case 'caption':
			return <div key={index} className="pub-caption">{renderSubLoop(node.content, meta)}</div>;
    case 'article':
			return <div key={index} className="pub-article">{renderSubLoop(node.content, meta)}</div>;
		case 'aside':
			return <span key={index}></span>;
		case 'equation':
			let equationText;
			if (node.content && node.content.length >= 1)  {
				equationText = node.content[0].text
			} else if (node.attrs.content) {
				equationText = node.attrs.content;
			}
			return <LatexRender key={index} value={equationText} block={false} />
		case 'block_equation':
			let blockEquationText;
			if (node.content && node.content.length >= 1)  {
				blockEquationText = node.content[0].text
			} else if (node.attrs.content) {
				blockEquationText = node.attrs.content;
			}
			return <LatexRender key={index} value={blockEquationText} block={true} />
		case 'html_block':
			return <HtmlRender key={index} {...node.attrs} />
		case 'iframe':
			return <IframeRender key={index} {...node.attrs} />
		case 'mention':
			let mentionURL = node.attrs.url;
			if (meta.fileMap[mentionURL]) {
				mentionURL = `/pub/${meta.slug}/files/${mentionURL}`;
			}

			return <MentionRender key={index} type={node.attrs.type} url={mentionURL}>{renderSubLoop(node.content, meta)}</MentionRender>

		case 'reference':
			const citationID = node.attrs.citationID;

			let label;

			if (meta.allReferences && meta.allReferences.length > 0) {
				meta.citationsInDoc.push(citationID);
				label = meta.engine.getShortForm(citationID);
			} else if (meta.docAttrs && meta.docAttrs.inlineBib) {
				label = meta.docAttrs.inlineBib[citationID];
			}

			return <ReferenceRender citationID={citationID} engine={meta.engine} key={index} label={label} {...node.attrs} />

		case 'diff':
			if (meta.diffType) {
				meta.diffType = null;
			} else {
				meta.diffType = node.attrs.type;
			}
			return <span></span>;

		case 'footnote':
			meta.footnoteCount = meta.footnoteCount + 1;
			return <FootnoteRender content={node.attrs.content} label={meta.footnoteCount} />
		case 'citations':
			let bib;

			if (meta.allReferences && meta.allReferences.length > 0) {
				bib = meta.engine.getBibliography(meta.citationsInDoc);
			} else if (meta.docAttrs && meta.docAttrs.bib) {
				bib = meta.docAttrs.bib;
			}
			return <CitationsRender key={index} renderedBib={bib} {...node.attrs} citations={node.content} />
		default:
			console.log('Error with ', node);
		}
	});

	return content;
};
