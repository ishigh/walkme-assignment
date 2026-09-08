import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { HANDS, compareHands, compareHandSets, toHand, winnerByWins } from './rules.js';

describe('toHand', () => {
  it('accepts every known hand', () => {
    for (const hand of HANDS) assert.equal(toHand(hand), hand);
  });

  it('throws on an unknown hand', () => {
    assert.throws(() => toHand('Lizard'), /Invalid hand "Lizard"/);
  });
});

describe('compareHands', () => {
  it('is a draw for identical hands', () => {
    for (const hand of HANDS) assert.equal(compareHands(hand, hand), 'draw');
  });

  it('follows Rock > Scissors > Paper > Rock', () => {
    assert.equal(compareHands('Rock', 'Scissors'), 'player1');
    assert.equal(compareHands('Scissors', 'Paper'), 'player1');
    assert.equal(compareHands('Paper', 'Rock'), 'player1');
    assert.equal(compareHands('Scissors', 'Rock'), 'player2');
    assert.equal(compareHands('Paper', 'Scissors'), 'player2');
    assert.equal(compareHands('Rock', 'Paper'), 'player2');
  });
});

describe('compareHandSets', () => {
  it('reports every hand pair in order', () => {
    const result = compareHandSets(['Rock', 'Paper', 'Scissors'], ['Scissors', 'Rock', 'Rock']);
    assert.deepEqual(result.hands, [
      { player1: 'Rock', player2: 'Scissors', winner: 'player1' },
      { player1: 'Paper', player2: 'Rock', winner: 'player1' },
      { player1: 'Scissors', player2: 'Rock', winner: 'player2' },
    ]);
  });

  it('awards the round to the player who wins more hands', () => {
    const result = compareHandSets(['Rock', 'Paper', 'Scissors'], ['Scissors', 'Rock', 'Rock']);
    assert.equal(result.player1Wins, 2);
    assert.equal(result.player2Wins, 1);
    assert.equal(result.winner, 'player1');

    const reversed = compareHandSets(['Scissors', 'Rock', 'Rock'], ['Rock', 'Paper', 'Scissors']);
    assert.equal(reversed.winner, 'player2');
  });

  it('is a draw when both players win the same number of hands', () => {
    assert.equal(compareHandSets(['Rock', 'Paper'], ['Scissors', 'Scissors']).winner, 'draw');
    assert.equal(compareHandSets(['Rock', 'Rock'], ['Rock', 'Rock']).winner, 'draw');
  });

  it('reports no single hand when both sets have the same size', () => {
    assert.equal('singleHand' in compareHandSets(['Rock', 'Paper'], ['Scissors', 'Scissors']), false);
    assert.equal('singleHand' in compareHandSets(['Rock'], ['Paper']), false);
  });

  it('plays a single hand against each of the other player hands', () => {
    const result = compareHandSets(['Rock'], ['Scissors', 'Paper', 'Rock']);
    assert.deepEqual(result, {
      hands: [
        { player1: 'Rock', player2: 'Scissors', winner: 'player1' },
        { player1: 'Rock', player2: 'Paper', winner: 'player2' },
        { player1: 'Rock', player2: 'Rock', winner: 'draw' },
      ],
      player1Wins: 1,
      player2Wins: 1,
      winner: 'draw',
      singleHand: { player: 'player1', hand: 'Rock' },
    });

    const mirrored = compareHandSets(['Scissors', 'Paper', 'Paper'], ['Rock']);
    assert.deepEqual(mirrored.singleHand, { player: 'player2', hand: 'Rock' });
    assert.equal(mirrored.hands.length, 3);
    assert.equal(mirrored.player1Wins, 2);
    assert.equal(mirrored.player2Wins, 1);
    assert.equal(mirrored.winner, 'player1');
  });

  it('throws on an empty set', () => {
    assert.throws(() => compareHandSets([], ['Rock']), /must not be empty \(player 1 has 0, player 2 has 1\)/);
    assert.throws(() => compareHandSets(['Rock', 'Paper'], []), /must not be empty/);
    assert.throws(() => compareHandSets([], []), /must not be empty/);
  });

  it('throws when the sizes differ and neither is a single hand', () => {
    assert.throws(
      () => compareHandSets(['Rock', 'Rock'], ['Rock', 'Rock', 'Rock']),
      /same length unless one of them is a single hand \(player 1 has 2, player 2 has 3\)/
    );
  });
});

describe('winnerByWins', () => {
  it('picks the side with more wins and draws on equal counts', () => {
    assert.equal(winnerByWins(2, 1), 'player1');
    assert.equal(winnerByWins(0, 3), 'player2');
    assert.equal(winnerByWins(1, 1), 'draw');
  });
});
