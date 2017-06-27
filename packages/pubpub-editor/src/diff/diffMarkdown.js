
const compareStrings = (text1, text2) => {

  var jsdiff = require('diff');
  var diffResult = jsdiff.diffSentences(text1, text2);
  let decos = [];
  let startCount = 0;


  let runningText = '';

  for (let [diffIndex, diff] of diffResult.entries()) {
    // const strippedString = diff.value.replace(/\s/g, '');
    const strippedString = diff.value;
    if (diff.removed) {
      runningText = runningText + "+++++" + diff.value + "+++++";
    } else if (diff.added) {
      runningText = runningText + "-----" + diff.value + "-----";
    } else {
      runningText = runningText + diff.value;
    }
  }

  return runningText;

}

export default compareStrings;
