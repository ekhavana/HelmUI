import test from 'node:test';
import assert from 'node:assert/strict';
import { displayedDepthFt } from './depth.ts';

test('displayedDepthFt adds offset to transducer depth', () => {
  assert.equal(displayedDepthFt(10, -2), 8);
  assert.equal(displayedDepthFt(10, 1.5), 11.5);
});

test('displayedDepthFt stays unknown when transducer is null', () => {
  assert.equal(displayedDepthFt(null, 2), null);
});
