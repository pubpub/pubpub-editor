'use strict';

function article(state, startLine) {
  var endLine = state.lineMax;

  var oldParentType = state.parentType;
  state.parentType = 'article';

  if (!!state.startedArticle) {
    return false;
  }

  state.startedArticle = true;

  var token = state.push('article_open', 'article', 1);
  state.md.block.tokenize(state, startLine, endLine);

  token = state.push('article_close', 'article', -1);
  token = state.push('citations', '', 0);

  state.parentType = oldParentType;

  return true;
};

module.exports = function citationsPlugin(md) {
  md.block.ruler.before('table', 'article', article);
  // md.inline.ruler.push('citations', citations);
};