import citationDoc from '../bugdata/citationemphasis';
import daisyDoc from '../bugdata/failingdaisydrives.json';
import { migrateJSON } from '../../src/migrate/migratev3';
const converted = migrateJSON(daisyDoc);

console.log('got converted!');
console.log(converted);
