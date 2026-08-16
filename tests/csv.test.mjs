import test from 'node:test';
import assert from 'node:assert/strict';
import { escapeCsvCell, toCsv } from '../src/domain/csv.js';

test('CSV uses BOM, CRLF quoting, and formula protection', () => {
  assert.equal(escapeCsvCell('=SUM(A1)'), "'=SUM(A1)");
  assert.equal(escapeCsvCell('  =SUM(A1)'), "'  =SUM(A1)");
  assert.equal(escapeCsvCell('\t+cmd'), "'\t+cmd");
  assert.equal(escapeCsvCell('a,b'), '"a,b"');
  assert.equal(escapeCsvCell('a"b'), '"a""b"');
  assert.equal(toCsv([{ title: 'a,b', count: 2 }]), '\uFEFFtitle,count\r\n"a,b",2\r\n');
});
