'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var compareStrings = function compareStrings(text1, text2) {

  var jsdiff = require('diff');
  var diffResult = jsdiff.diffSentences(text1, text2);
  var runningText = '';

  var diffEntries = diffResult.entries();
  // debugger;
  // console.log(diffResult);

  for (var i = 0; i < diffResult.length; i++) {
    var result = diffResult[i];
    var next = diffResult[i + 1];
    if (result.removed && next && next.added) {
      var removed = result.value;
      var added = diffResult[i + 1].value;
      i++;
      runningText = runningText + resolveSentence(removed, added);
    } else if (result.removed) {
      runningText = runningText + "+++++" + result.value + "+++++";
    } else if (result.added) {
      runningText = runningText + "-----" + result.value + "-----";
    } else {
      runningText += result.value;
    }
  }

  /*
   for (let [diffIndex, diff] of diffResult.entries()) {
    // const strippedString = diff.value.replace(/\s/g, '');
    console.log(diff);
    const strippedString = diff.value;
    if (diff.removed) {
      runningText = runningText + "+++++" + diff.value + "+++++";
    } else if (diff.added) {
      runningText = runningText + "-----" + diff.value + "-----";
    } else {
      runningText = runningText + diff.value;
    }
  }
  */

  return runningText;
};

var resolveSentence = function resolveSentence(sentence1, sentence2) {
  var jsdiff = require('diff');
  var diffResult = jsdiff.diffWords(sentence1, sentence2);

  if (diffResult.length > 5) {
    return "+++++" + sentence1 + "+++++" + "-----" + sentence2 + "-----";
  }

  var runningText = '';

  for (var i = 0; i < diffResult.length; i++) {
    var result = diffResult[i];
    if (result.removed) {
      runningText = runningText + "+++++" + result.value + "+++++";
    } else if (result.added) {
      runningText = runningText + "-----" + result.value + "-----";
    } else {
      runningText += result.value;
    }
  }

  return runningText;
};

exports.default = compareStrings;