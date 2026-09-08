import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CpuPlayer } from './cpuPlayer.js';
import { HumanPlayer } from './humanPlayer.js';
import { PLAYER_TYPES } from './player.js';
import { createPlayer } from './playerFactory.js';

describe('createPlayer', () => {
  it('creates a named player for every known type', () => {
    for (const type of PLAYER_TYPES) assert.equal(createPlayer(type, 'Player 1').name, 'Player 1');
  });

  it('maps each type to its player class', () => {
    assert.ok(createPlayer('Human', 'Player 1') instanceof HumanPlayer);
    assert.ok(createPlayer('CPU', 'Player 2') instanceof CpuPlayer);
  });

  it('throws on an unknown type, naming the player and the accepted types', () => {
    assert.throws(
      () => createPlayer('Cpu', 'Player 2'),
      /Player 2: unknown player type "Cpu"\. Expected one of: Human, CPU/
    );
  });
});
