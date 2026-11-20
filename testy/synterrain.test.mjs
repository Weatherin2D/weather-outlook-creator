import assert from 'node:assert/strict';
import test from 'node:test';
import {
  SYN_TERRAIN_NX, SYN_TERRAIN_NY, createWorld, createSynTerrain, paintSynTerrain,
  sampleSynTerrain, synTerrainFingerprint, packSynTerrain, unpackSynTerrain, peWorldSampler,
} from '../src/world.js';

test('synoptic terrain can be edited independently from the local world', () => {
  const world = createWorld(2, 2);
  world.h.fill(750);
  const terrain = createSynTerrain(world, { lat0: 0, lon0: 0, dx: 1000, dy: 1000, nx: 2, ny: 2 },
    { latCenter: 0, latSpan: 20 });
  assert.equal(terrain.nx, SYN_TERRAIN_NX);
  assert.equal(terrain.ny, SYN_TERRAIN_NY);
  assert.ok(terrain.h.every((height) => height === 750));

  const local = peWorldSampler(world, { lat0: 0, lon0: 0, dx: 1000, dy: 1000, nx: 2, ny: 2 });
  const separate = peWorldSampler(world, { lat0: 0, lon0: 0, dx: 1000, dy: 1000, nx: 2, ny: 2 },
    terrain, 0, 20);
  terrain.h.fill(0);
  terrain.h.fill(2500, terrain.nx * 70);
  assert.equal(local.elev(0, 0), 750);
  assert.notEqual(separate.elev(-5, 0), separate.elev(5, 0));
});

test('synoptic terrain brush wraps longitude but clips at the latitude edges', () => {
  const terrain = { nx: 8, ny: 4, h: new Float32Array(32) };
  paintSynTerrain(terrain, 0.1, 0.1, 1, 1000);
  assert.ok(terrain.h[0] > 0);
  assert.ok(terrain.h[7] > 0);
  assert.equal(terrain.h[3 * terrain.nx], 0);
});

test('synoptic terrain sampling wraps longitude and clamps latitude', () => {
  const terrain = { nx: 4, ny: 3, h: new Float32Array(12) };
  for (let j = 0; j < terrain.ny; j++) terrain.h.fill(j * 1000, j * terrain.nx, (j + 1) * terrain.nx);
  assert.equal(sampleSynTerrain(terrain, -20, 10, 0, 20), 0);
  assert.equal(sampleSynTerrain(terrain, 20, 10, 0, 20), 2000);
  assert.equal(sampleSynTerrain(terrain, 0, -180, 0, 20), sampleSynTerrain(terrain, 0, 180, 0, 20));
});

test('synoptic terrain survives save-state packing and fingerprints edits', () => {
  assert.equal(unpackSynTerrain(null), null);
  const terrain = { nx: SYN_TERRAIN_NX, ny: SYN_TERRAIN_NY, h: new Float32Array(SYN_TERRAIN_NX * SYN_TERRAIN_NY) };
  terrain.h[10] = 1234;
  const packed = packSynTerrain(terrain);
  const restored = unpackSynTerrain(packed);
  assert.equal(restored.h[10], 1234);
  assert.equal(synTerrainFingerprint(restored), synTerrainFingerprint(terrain));
  restored.h[10]++;
  assert.notEqual(synTerrainFingerprint(restored), synTerrainFingerprint(terrain));
  assert.throws(() => unpackSynTerrain({ nx: 1, ny: 1, h: [0] }), /incompatible layout/);
});
