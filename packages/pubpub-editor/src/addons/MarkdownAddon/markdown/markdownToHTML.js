import toMarkdown from 'to-markdown';

const converters = [
  {
    filter: ['html', 'body', 'span', 'div'],
    replacement: function(innerHTML) {
      return innerHTML;
    }
  },
  {
    filter: ['head', 'script', 'style'],
    replacement: function() {
      return '';
    }
  },
 {
    filter: function (node) {
      return node.nodeName === 'A' && !node.getAttribute('href')
    },
    replacement: function (content, node) {
      return content;
    }
  },
  ];



  exports.markdowntoHTML = function(htmlStr) {
    return toMarkdown(htmlStr, { gfm: true, converters });
  };
