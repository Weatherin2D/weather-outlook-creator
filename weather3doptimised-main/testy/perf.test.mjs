import test from 'node:test';
import assert from 'node:assert/strict';
import { canvasScale, MAX_GPU_BACKLOG, MAX_STEPS, maxModeSteps } from '../src/perf.js';

test('Max mode fills only available buffer-sized GPU queue slots', () => {
  assert.equal(maxModeSteps(0), MAX_GPU_BACKLOG * MAX_STEPS);
  assert.equal(maxModeSteps(1), MAX_STEPS);
  assert.equal(maxModeSteps(MAX_GPU_BACKLOG), 0);
  assert.equal(maxModeSteps(MAX_GPU_BACKLOG + 1), 0);
});

test('low-tier render scaling lowers pixel density without changing fidelity mode', () => {
  assert.equal(canvasScale('balanced', false, 'low'), 0.6);
  assert.equal(canvasScale('balanced', true, 'low'), 0.35);
  assert.equal(canvasScale('smooth', false, 'low'), 0.5);
  assert.equal(canvasScale('smooth', true, 'low'), 0.3);
  assert.equal(canvasScale('fidelity', false, 'low'), 1);
  assert.equal(canvasScale('fidelity', true, 'low'), 0.6);
});

test('mid/high-tier rendering keeps existing scale choices', () => {
  for (const tier of ['mid', 'high']) {
    assert.equal(canvasScale('balanced', false, tier), 0.9);
    assert.equal(canvasScale('balanced', true, tier), 0.5);
    assert.equal(canvasScale('smooth', false, tier), 0.75);
    assert.equal(canvasScale('smooth', true, tier), 0.4);
  }
});
