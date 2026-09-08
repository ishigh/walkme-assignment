import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { HANDS } from '../game/rules.js';
import { CpuPlayer, drawAll, type RandomSource } from './cpuPlayer.js';

/** Hands out the given values in order: a deterministic stand-in for Math.random. */
const sequence = (...values: number[]): RandomSource => {
  let next = 0;
  return () => values[next++];
};

describe('drawAll', () => {
  it('draws exactly as many hands as requested', () => {
    assert.equal(drawAll(1), 1);
    assert.equal(drawAll(3), 3);
  });
});

describe('CpuPlayer', () => {
  it('draws the number of hands the strategy decides', async () => {
    assert.equal((await new CpuPlayer('CPU', drawAll, () => 0).getHands(3)).length, 3);
    assert.equal((await new CpuPlayer('CPU', () => 1, () => 0).getHands(3)).length, 1);
  });

  it('maps the random source onto the hand list in order', async () => {
    const player = new CpuPlayer('CPU', drawAll, sequence(0, 0.5, 0.99));
    assert.deepEqual(await player.getHands(3), ['Rock', 'Paper', 'Scissors']);
  });

  it('draws only known hands with the real random source', async () => {
    const hands = await new CpuPlayer('CPU', drawAll, Math.random).getHands(100);
    for (const hand of hands) assert.ok(HANDS.includes(hand), `unknown hand ${hand}`);
  });
});
