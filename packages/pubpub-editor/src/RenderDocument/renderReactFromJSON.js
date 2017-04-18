import { CitationsRender, EmbedRender, IframeRender, LatexRender, MentionRender, ReferenceRender } from './renderComponents';

import { CitationEngine } from '../references';
import React from 'react';

/*
CSL engine API endpoint...
- serialize each reference decorations?
*/


export const renderReactFromJSON = function(doc, fileMap, allReferences) {

	const engine = new CitationEngine();
	engine.setBibliography(allReferences);

	const docAttrs = (doc.attrs && doc.attrs.meta) ? doc.attrs.meta : null;

	const citationsInDoc = [];

	const meta = {fileMap, allReferences, engine, docAttrs, citationsInDoc};


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
			return <div className={'p-block'} key={index}>{renderSubLoop(node.content, meta)}</div>;
		case 'page_break':
			return <div className={'pagebreak'} key={index}>pagebreak</div>;
		case 'image':
			return <img {...node.attrs} key={index}/>;
		case 'hard_break':
			return <br key={index}/>;
		case 'emoji':
			return node.attrs.content;
		case 'text':
			const marks = node.marks || [];
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
				case 'link':
					return <a href={current.attrs.href} title={current.attrs.title} key={index} target={'_top'}>{previous}</a>;
				default:
					return previous;
				}
			}, node.text);

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
			}			return <LatexRender key={index} value={blockEquationText} block={true} />
		case 'iframe':
			return <IframeRender key={index} {...node.attrs} />
		case 'mention':
			return <MentionRender key={index} {...node.attrs}>{renderSubLoop(node.content, meta)}</MentionRender>

		case 'reference':
			const citationID = node.attrs.citationID;

			let label;

			if (meta.allReferences && meta.allReferences.length > 0) {
				meta.citationsInDoc.push(citationID);
				label = meta.engine.getShortForm(citationID);
			} else if (meta.docAttrs && meta.docAttrs.inlineBib) {
				label = meta.docAttrs.inlineBib[citationID];
			}

			return <ReferenceRender key={index} label={label} {...node.attrs} />
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
