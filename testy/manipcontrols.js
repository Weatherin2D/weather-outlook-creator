import assert from 'node:assert/strict';
import test from 'node:test';
import { manipQuery } from '../src/manip.js';

test('neutral atmospheric controls do not add query parameters', () => {
  assert.equal(manipQuery(0, 1, 1, 0, 1, 0, 0), '');
});

test('atmospheric controls are carried into shared start and restart URLs', () => {
  assert.equal(
    manipQuery(2, 1.25, 1.5, 10, 1.25, -2.5, -5),
    '&tan=2&rnf=1.25&vrf=1.5&rha=10&wdf=1.25&pah=-2.5&cla=-5',
  );
});
