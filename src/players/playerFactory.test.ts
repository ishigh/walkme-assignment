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
    assert.ok(createPlayer('Monkey', 'Player 2') instanceof CpuPlayer);
  });

  it('gives the CPU every hand the game asks for and the Monkey a single one', async () => {
    assert.equal((await createPlayer('CPU', 'Player 1').getHands(3)).length, 3);
    assert.equal((await createPlayer('Monkey', 'Player 2').getHands(3)).length, 1);
  });

  it('throws on an unknown type, naming the player and the accepted types', () => {
    assert.throws(
      () => createPlayer('Cpu', 'Player 2'),
      /Player 2: unknown player type "Cpu"\. Expected one of: Human, CPU, Monkey/
    );
  });
});
