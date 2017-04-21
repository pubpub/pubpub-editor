/*import filterXSS from 'xss';
import { whiteList } from 'xss/lib/default';

const defaultList = whiteList;
defaultList['iframe'] = ['src', 'width', 'height'];

export default function(html) {
  return filterXSS(html, {
    whiteList: defaultList,
    css: false
  });
}
*/

export default function(html) {
  return html;
}
