var convert = require('../../ppubToPandoc.js').ppubToPandoc;
var chai = require('chai');
var expect = chai.expect;

var write = require('fs-writefile-promise');
var execPromise = require('child-process-promise').exec;

var convertPandocToPpub = require('../../pandocToPpub').pandocToPpub;

describe('Convert docJSON to PandocAST', function() {
	describe(', successful to: ', function() {
		it('simple bold', (done) => {
			const testName = 'bold';
			const pandocFile = `${__dirname}/pandoc/${testName}.json`;
			const markdownFile = `${__dirname}/md/${testName}.md`;
			convert(require(`./${testName}.json`), {bibFile: `test/toPandoc/bib/${testName}.bib` })
			.then((result) => {
				return write(pandocFile, JSON.stringify(result, null, '\t'));
			})
			.then(function() {
				return execPromise(`pandoc -f JSON ${pandocFile} --filter=pandoc-citeproc -t markdown-simple_tables+pipe_tables --atx-headers -o ${markdownFile}`);
			})
			.then(function(result) {
				expect(result).to.exist;
			})
			.then(done, done);
		});

		it('simple italic', (done) => {
			const testName = 'italic';
			const pandocFile = `${__dirname}/pandoc/${testName}.json`;
			const markdownFile = `${__dirname}/md/${testName}.md`;
			convert(require(`./${testName}.json`), {bibFile: `test/toPandoc/bib/${testName}.bib` })
			.then((result) => {
				return write(pandocFile, JSON.stringify(result, null, '\t'));
			})
			.then(function() {
				return execPromise(`pandoc -f JSON ${pandocFile} --filter=pandoc-citeproc -t markdown-simple_tables+pipe_tables --atx-headers -o ${markdownFile}`);
			})
			.then(function(result) {
				expect(result).to.exist;
			})
			.then(done, done);
		});
		it('simple bold and italic', (done) => {
			const testName = 'bold-and-italic';
			const pandocFile = `${__dirname}/pandoc/${testName}.json`;
			const markdownFile = `${__dirname}/md/${testName}.md`;
			convert(require(`./${testName}.json`), {bibFile: `test/toPandoc/bib/${testName}.bib` })
			.then((result) => {
				return write(pandocFile, JSON.stringify(result, null, '\t'));
			})
			.then(function() {
				return execPromise(`pandoc -f JSON ${pandocFile} --filter=pandoc-citeproc -t markdown-simple_tables+pipe_tables --atx-headers -o ${markdownFile}`);
			})
			.then(function(result) {
				expect(result).to.exist;
			})
			.then(done, done);
		});
		it('simple heading one', (done) => {
			const testName = 'heading-one';
			const pandocFile = `${__dirname}/pandoc/${testName}.json`;
			const markdownFile = `${__dirname}/md/${testName}.md`;
			convert(require(`./${testName}.json`), {bibFile: `test/toPandoc/bib/${testName}.bib` })
			.then((result) => {
				return write(pandocFile, JSON.stringify(result, null, '\t'));
			})
			.then(function() {
				return execPromise(`pandoc -f JSON ${pandocFile} --filter=pandoc-citeproc -t markdown-simple_tables+pipe_tables --atx-headers -o ${markdownFile}`);
			})
			.then(function(result) {
				expect(result).to.exist;
			})

			.then(done, done);
		});
		it('simple strikethrough', (done) => {
			const testName = 'strikethrough';
			const pandocFile = `${__dirname}/pandoc/${testName}.json`;
			const markdownFile = `${__dirname}/md/${testName}.md`;
			convert(require(`./${testName}.json`), { bibFile: `test/toPandoc/bib/${testName}.bib` })
			.then((result) => {
				return write(pandocFile, JSON.stringify(result, null, '\t'));
			})
			.then(function() {
				return execPromise(`pandoc -f JSON ${pandocFile} --filter=pandoc-citeproc -t markdown-simple_tables+pipe_tables --atx-headers -o ${markdownFile}`);
			})
			.then(function(result) {
				expect(result).to.exist;
			})
			.then(done, done);
		});
		it('simple image', (done) => {
			const testName = 'image';
			const pandocFile = `${__dirname}/pandoc/${testName}.json`;
			const markdownFile = `${__dirname}/md/${testName}.md`;
			convert(require(`./${testName}.json`), {bibFile: `test/toPandoc/bib/${testName}.bib` })
			.then((result) => {
				return write(pandocFile, JSON.stringify(result, null, '\t'));
			})
			.then(function() {
				return execPromise(`pandoc -f JSON ${pandocFile} --filter=pandoc-citeproc -t markdown-simple_tables+pipe_tables --atx-headers -o ${markdownFile}`);
			})
			.then(function(result) {
				expect(result).to.exist;
			})
			.then(done, done);
		});
		it('simple code', (done) => {
			const testName = 'code';
			const pandocFile = `${__dirname}/pandoc/${testName}.json`;
			const markdownFile = `${__dirname}/md/${testName}.md`;
			convert(require(`./${testName}.json`), {bibFile: `test/toPandoc/bib/${testName}.bib` })
			.then((result) => {
				return write(pandocFile, JSON.stringify(result, null, '\t'));
			})
			.then(function() {
				return execPromise(`pandoc -f JSON ${pandocFile} --filter=pandoc-citeproc -t markdown-simple_tables+pipe_tables --atx-headers -o ${markdownFile}`);
			})
			.then(function(result) {
				expect(result).to.exist;
			})
			.then(done, done);
		});
		it('new lines', (done) => {
			const testName = 'newlines';
			const pandocFile = `${__dirname}/pandoc/${testName}.json`;
			const markdownFile = `${__dirname}/md/${testName}.md`;
			convert(require(`./${testName}.json`), {bibFile: `test/toPandoc/bib/${testName}.bib` })
			.then((result) => {
				return write(pandocFile, JSON.stringify(result, null, '\t'));
			})
			.then(function() {
				return execPromise(`pandoc -f JSON ${pandocFile} --filter=pandoc-citeproc -t markdown-simple_tables+pipe_tables --atx-headers -o ${markdownFile}`);
			})
			.then(function(result) {
				expect(result).to.exist;
			})
			.then(done, done);
		});
		it('ordered list', (done) => {
			const testName = 'ordered-list';
			const pandocFile = `${__dirname}/pandoc/${testName}.json`;
			const markdownFile = `${__dirname}/md/${testName}.md`;
			convert(require(`./${testName}.json`), {bibFile: `test/toPandoc/bib/${testName}.bib` })
			.then((result) => {
				return write(pandocFile, JSON.stringify(result, null, '\t'));
			})
			.then(function() {
				return execPromise(`pandoc -f JSON ${pandocFile} --filter=pandoc-citeproc -t markdown-simple_tables+pipe_tables --atx-headers -o ${markdownFile}`);
			})
			.then(function(result) {
				expect(result).to.exist;
			})
			.then(done, done);
		});
		it('text before first word', (done) => {
			const testName = 'text-before-paragraph';
			const pandocFile = `${__dirname}/pandoc/${testName}.json`;
			const markdownFile = `${__dirname}/md/${testName}.md`;
			convert(require(`./${testName}.json`), {bibFile: `test/toPandoc/bib/${testName}.bib` })
			.then((result) => {
				return write(pandocFile, JSON.stringify(result, null, '\t'));
			})
			.then(function() {
				return execPromise(`pandoc -f JSON ${pandocFile} --filter=pandoc-citeproc -t markdown-simple_tables+pipe_tables --atx-headers -o ${markdownFile}`);
			})
			.then(function(result) {
				expect(result).to.exist;
			})
			.then(done, done);
		});
		it('superscript', (done) => {
			const testName = 'superscript';
			const pandocFile = `${__dirname}/pandoc/${testName}.json`;
			const markdownFile = `${__dirname}/md/${testName}.md`;
			convert(require(`./${testName}.json`), {bibFile: `test/toPandoc/bib/${testName}.bib` })
			.then((result) => {
				return write(pandocFile, JSON.stringify(result, null, '\t'));
			})
			.then(function() {
				return execPromise(`pandoc -f JSON ${pandocFile} --filter=pandoc-citeproc -t markdown-simple_tables+pipe_tables --atx-headers -o ${markdownFile}`);
			})
			.then(function(result) {
				expect(result).to.exist;
			})
			.then(done, done);
		});
		it('subscript', (done) => {
			const testName = 'subscript';
			const pandocFile = `${__dirname}/pandoc/${testName}.json`;
			const markdownFile = `${__dirname}/md/${testName}.md`;
			convert(require(`./${testName}.json`), {bibFile: `test/toPandoc/bib/${testName}.bib` })
			.then((result) => {
				return write(pandocFile, JSON.stringify(result, null, '\t'));
			})
			.then(function() {
				return execPromise(`pandoc -f JSON ${pandocFile} --filter=pandoc-citeproc -t markdown-simple_tables+pipe_tables --atx-headers -o ${markdownFile}`);
			})
			.then(function(result) {
				expect(result).to.exist;
			})
			.then(done, done);
		});
		it('quotation', (done) => {
			const testName = 'quotation';
			const pandocFile = `${__dirname}/pandoc/${testName}.json`;
			const markdownFile = `${__dirname}/md/${testName}.md`;
			convert(require(`./${testName}.json`), {bibFile: `test/toPandoc/bib/${testName}.bib` })
			.then((result) => {
				return write(pandocFile, JSON.stringify(result, null, '\t'));
			})
			.then(function() {
				return execPromise(`pandoc -f JSON ${pandocFile} --filter=pandoc-citeproc -t markdown-simple_tables+pipe_tables --atx-headers -o ${markdownFile}`);
			})
			.then(function(result) {
				expect(result).to.exist;
			})
			.then(done, done);
		});
		it('simple table', (done) => {
			const testName = 'table';
			const pandocFile = `${__dirname}/pandoc/${testName}.json`;
			const markdownFile = `${__dirname}/md/${testName}.md`;
			convert(require(`./${testName}.json`), {bibFile: `test/toPandoc/bib/${testName}.bib` })
			.then((result) => {
				return write(pandocFile, JSON.stringify(result, null, '\t'));
			})
			.then(function() {
				return execPromise(`pandoc -f JSON ${pandocFile} --filter=pandoc-citeproc -t markdown-simple_tables+pipe_tables --atx-headers -o ${markdownFile}`);
			})
			.then(function(result) {
				expect(result).to.exist;
			})
			.then(done, done);
		});
		it('more complex pub', (done) => {
			const testName = 'more-complex-pub';
			const pandocFile = `${__dirname}/pandoc/${testName}.json`;
			const markdownFile = `${__dirname}/md/${testName}.md`;
			convert(require(`./${testName}.json`), {bibFile: `test/toPandoc/bib/${testName}.bib` })
			.then((result) => {
				return write(pandocFile, JSON.stringify(result, null, '\t'));
			})
			.then(function() {
				return execPromise(`pandoc -f JSON ${pandocFile} --filter=pandoc-citeproc -t markdown-simple_tables+pipe_tables --atx-headers -o ${markdownFile}`);
			})
			.then(function(result) {
				expect(result).to.exist;
			})
			.then(done, done);
		});
		it('nested ordered lists', (done) => {
			const testName = 'nested-ol';
			const pandocFile = `${__dirname}/pandoc/${testName}.json`;
			const markdownFile = `${__dirname}/md/${testName}.md`;
			convert(require(`./${testName}.json`), {bibFile: `test/toPandoc/bib/${testName}.bib` })
			.then((result) => {
				return write(pandocFile, JSON.stringify(result, null, '\t'));
			})
			.then(function() {
				return execPromise(`pandoc -f JSON ${pandocFile} --filter=pandoc-citeproc -t markdown-simple_tables+pipe_tables --atx-headers -o ${markdownFile}`);
			})
			.then(function(result) {
				expect(result).to.exist;
			})
			.then(done, done);
		});

		it('code block', (done) => {
			const testName = 'codeblock';
			const pandocFile = `${__dirname}/pandoc/${testName}.json`;
			const markdownFile = `${__dirname}/md/${testName}.md`;
			convert(require(`./${testName}.json`), {bibFile: `test/toPandoc/bib/${testName}.bib` })
			.then((result) => {
				return write(pandocFile, JSON.stringify(result, null, '\t'));
			})
			.then(function() {
				return execPromise(`pandoc -f JSON ${pandocFile} --filter=pandoc-citeproc -t markdown-simple_tables+pipe_tables --atx-headers -o ${markdownFile}`);
			})
			.then(function(result) {
				expect(result).to.exist;
			})
			.then(done, done);
		});
		it('table 4 empty cells', (done) => {
			const testName = 'table-4-empty-cells';
			const pandocFile = `${__dirname}/pandoc/${testName}.json`;
			const markdownFile = `${__dirname}/md/${testName}.md`;
			convert(require(`./${testName}.json`), {bibFile: `test/toPandoc/bib/${testName}.bib` })
			.then((result) => {
				return write(pandocFile, JSON.stringify(result, null, '\t'));
			})
			.then(function() {
				return execPromise(`pandoc -f JSON ${pandocFile} --filter=pandoc-citeproc -t markdown-simple_tables+pipe_tables --atx-headers -o ${markdownFile}`);
			})
			.then(function(result) {
				expect(result).to.exist;
			})
			.then(done, done);
		});
		it('citations', (done) => {
			const testName = 'citations';
			const pandocFile = `${__dirname}/pandoc/${testName}.json`;
			const markdownFile = `${__dirname}/md/${testName}.md`;
			convert(require(`./${testName}.json`), {bibFile: `test/toPandoc/bib/${testName}.bib` })
			.then((result) => {
				return write(pandocFile, JSON.stringify(result, null, '\t'));
			})
			.then(function() {
				return execPromise(`pandoc -f JSON ${pandocFile} --filter=pandoc-citeproc -t markdown-simple_tables+pipe_tables --atx-headers -o ${markdownFile}`);
			})
			.then(function(result) {
				expect(result).to.exist;
			})
			.then(done, done);
		});
		it('complete pub 1', (done) => {
			const testName = 'complete-pub-1';
			const pandocFile = `${__dirname}/pandoc/${testName}.json`;
			const markdownFile = `${__dirname}/md/${testName}.md`;
			convert(require(`./${testName}.json`), {bibFile: `test/toPandoc/bib/${testName}.bib` })
			.then((result) => {
				return write(pandocFile, JSON.stringify(result, null, '\t'));
			})
			.then(function() {
				return execPromise(`pandoc -f JSON ${pandocFile} --filter=pandoc-citeproc -t markdown-simple_tables+pipe_tables --atx-headers -o ${markdownFile}`);
			})
			.then(function(result) {
				expect(result).to.exist;
			})
			.then(done, done);
		});

		it('metadata', (done) => {
			const testName = 'metadata';
			const pandocFile = `${__dirname}/pandoc/${testName}.json`;
			const markdownFile = `${__dirname}/md/${testName}.md`;
			const metadata = {
				title: 'Encoding Data into Physical Objects with Digitally Fabricated Textures',
				authors: ['Travis Rich'],
				degree: 'Master of Science in Media Arts and Sciences',
				university: 'Massachussets Institute of Technology',
				// date: '05/09/1991',
				'supervisor-name': 'Andrew Lippman',
				'supervisor-title': 'Associate Director & Senior Research Scientist, MIT Media Lab',
				'department-chairman-name': 'Professor Patricia Maes',
				'department-chairman-title': 'Associate Academic Head, Program in Media Arts and Sciences',
				acknowledgements: 'Like all good adventures, landing at the end of writing your thesis is filled with as much excitement for the end result as bewilderment at the path it took to get there. As twisting and windy as that path may have been, there are always hoards of people who have kept me from skidding past the sharp turns and sinking too far into the deep dives. To that end, thank you everyone who helped me get from A to B (and Z, H, K, and M in between). The Media Lab is unlike any community I’ve ever been a part of and I’m extremely grateful to have been able to complete this work as part of it. Thank you everyone for the Friday teas, 99 Fridays, ping pong, free appetizers, foodcam rations, and Muddy brainstorms. With the utmost gratitude, I thank my advisor, Andy Lippman, for bringing me to the Lab and providing amazing experiences throughout this two years Master’s. I’m extremely grateful for all the support, advice, and ideas you’ve given me. Thank you to my readers, Pattie Maes and Mike Bove, for helping me funnel the sparks in my head down into something worthwhile and exciting. It’s been wonderful working with you. Thanks to the Viral Spaces group (Matt Blackshaw, Kwan Hong Lee , Julia Ma, Dawei Shen, Shen Shen, Dan Sawada, Jonathan Speiser, Eyal Toledano, Deb Widener, Grace Woo, and Polychronis Ypodimatopoulos) for being in the trenches with me and giving me enough fuel for thought to last decades. Thanks to all the MIT friends who have been there to get food, drinks, and free t-shirts for these past two years. Nothing is sadder than the fact that we don’t get to always play in the same building. In more ways than I can count, I’m indebted to my family — Dad, Mom, Josh, and Peter — for raising me to be eager and interested in exploring the world’s questions. Thank you. To my non-genetic family at 9 Rollins, thanks for keeping me sane and happy. To Grace Lin, thanks for being there every step of the way. I couldn’t be happier that I get to share countless adventures with you. To all my friends inside and outside the Lab, thank you for taking me to where I am today.',
				abstract: 'This thesis presents and outlines a system for encoding physical passive objects with deterministic surface features that contain identifying information about that object. The goal of such work is to take steps towards a self-descriptive universe in which all objects contain within their physical structure hooks to information about how they can be used, how they can be fixed, what they’re used for, who uses them, etc. By exploring modern manufacturing processes, several techniques for creating these deterministic textures are presented. Of high importance is the advancement of 3D printing technologies. By leveraging the rapid prototyping capabilities such machines offer, this thesis looks at how personalized objects and draft models may be encoded with data that allows annotations, ideas, and notes to be associated with physical points across that object. Whereas barcodes, QR codes, and RFID tags are often used to associate a single object with a single piece of data, this technique of encoding surfaces will allow for many points of identification to be placed on a single object, enabling applications in learning, group interaction, and gaming.',
				'degree-month': 'June',
				'degree-year': '2013',
				'thesis-date': 'May 6, 2013',
				department: 'Program in Media Arts and Sciences, School of Architecture and Planning',
				'past-degrees': ['B.S. Boston University (2010)', 'M.S., Boston University (2011)'],
				'reader-one-name': 'Patricia Maes',
				'reader-one-title': 'Professor of Media Technology',
				'reader-one-affiliation': 'Program in Media Arts and Sciences',
				'reader-two-name': 'V. Michael Bove, Jr',
				'reader-two-title': 'Principal Research Scientist',
				'reader-two-affiliation': 'Media Lab',
				'pub-readers': [
					{ name: 'Patricia Maes', title: 'Professor of Media Technology', affiliation:  'Program in Media Arts and Sciences' },
					{ name: 'Goerge Sweg', title: 'Professor of Fun', affiliation:  'Media Arts and Sciences' },
					{ name: 'Johnaothon Lolsworthy', title: 'Professor of Terror', affiliation:  'Program of Letters and Predation' },
					{ name: 'V. Michael Bove, Jr', title: 'Principal Research Scientist', affiliation: 'Media Lab' }
				]

			};
			convert(require(`./${testName}.json`), { bibFile: `test/toPandoc/bib/${testName}.bib`, metadata: metadata })
			.then((result) => {
				return write(pandocFile, JSON.stringify(result, null, '\t'));
			})
			.then(function() {
				return execPromise(`pandoc -f JSON ${pandocFile} --filter=pandoc-citeproc -t markdown-simple_tables+pipe_tables --atx-headers -o ${markdownFile}`);
			})
			.then(function(result) {
				expect(result).to.exist;
			})
			.then(done, done);
		});
	});
});
