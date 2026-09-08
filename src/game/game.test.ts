import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { Player } from '../players/player.js';
import { Game, type GameReporter, type GameResult } from './game.js';
import { compareHandSets, type Hand, type RoundResult } from './rules.js';

/** Plays the scripted hand sets one round at a time and logs each draw; running out of script is a test bug. */
const scripted = (log: string[], name: string, ...rounds: Hand[][]): Player => {
  let next = 0;
  return {
    name,
    getHands: async (numberOfHands: number) => {
      log.push(`${name} draws ${numberOfHands}`);
      if (next === rounds.length) throw new Error(`${name} has no hands scripted for round ${next + 1}`);
      return rounds[next++];
    },
  };
};

/** Logs every report in order instead of printing, and keeps what was reported for assertions. */
class RecordingReporter implements GameReporter {
  readonly rounds: RoundResult[] = [];
  result?: GameResult;

  constructor(private readonly log: string[]) {}

  roundStarted(roundNumber: number, numberOfRounds: number): void {
    this.log.push(`round ${roundNumber}/${numberOfRounds} started`);
  }

  roundFinished(round: RoundResult): void {
    this.rounds.push(round);
    this.log.push(`round finished: ${round.winner}`);
  }

  gameFinished(result: GameResult): void {
    this.result = result;
    this.log.push(`game finished: ${result.winner}`);
  }
}

const ROCK: Hand[] = ['Rock'];
const PAPER: Hand[] = ['Paper'];
const SCISSORS: Hand[] = ['Scissors'];

/** One-hand rounds: round i is `player1Rounds[i]` against `player2Rounds[i]`; returns the final result. */
const play = (player1Rounds: Hand[][], player2Rounds: Hand[][]): Promise<GameResult> => {
  const log: string[] = [];
  const settings = { numberOfRounds: player1Rounds.length, numberOfHands: 1 };
  const player1 = scripted(log, 'P1', ...player1Rounds);
  const player2 = scripted(log, 'P2', ...player2Rounds);
  return new Game(player1, player2, settings, new RecordingReporter(log)).play();
};

describe('Game', () => {
  it('asks player 1 then player 2 for each round in turn, and reports every step in order', async () => {
    const log: string[] = [];
    const player1 = scripted(log, 'P1', ['Rock', 'Rock', 'Rock'], ['Paper', 'Rock', 'Rock']);
    const player2 = scripted(log, 'P2', ['Scissors', 'Rock', 'Paper'], ['Rock', 'Scissors', 'Paper']);
    const reporter = new RecordingReporter(log);

    const result = await new Game(player1, player2, { numberOfRounds: 2, numberOfHands: 3 }, reporter).play();

    assert.deepEqual(log, [
      'round 1/2 started',
      'P1 draws 3',
      'P2 draws 3',
      'round finished: draw',
      'round 2/2 started',
      'P1 draws 3',
      'P2 draws 3',
      'round finished: player1',
      'game finished: player1',
    ]);
    assert.deepEqual(reporter.rounds, [
      compareHandSets(['Rock', 'Rock', 'Rock'], ['Scissors', 'Rock', 'Paper']),
      compareHandSets(['Paper', 'Rock', 'Rock'], ['Rock', 'Scissors', 'Paper']),
    ]);
    assert.deepEqual(result, { player1Wins: 1, player2Wins: 0, draws: 1, winner: 'player1' });
    assert.equal(reporter.result, result);
  });

  it('awards the game to the player who wins more rounds', async () => {
    const result = await play([ROCK, PAPER, ROCK], [SCISSORS, ROCK, PAPER]);
    assert.deepEqual(result, { player1Wins: 2, player2Wins: 1, draws: 0, winner: 'player1' });

    const reversed = await play([SCISSORS, ROCK, PAPER], [ROCK, PAPER, ROCK]);
    assert.deepEqual(reversed, { player1Wins: 1, player2Wins: 2, draws: 0, winner: 'player2' });
  });

  it('is a draw when both players win the same number of rounds, counting drawn rounds apart', async () => {
    const oneEach = await play([ROCK, ROCK, ROCK], [SCISSORS, PAPER, ROCK]);
    assert.deepEqual(oneEach, { player1Wins: 1, player2Wins: 1, draws: 1, winner: 'draw' });

    const allDrawn = await play([ROCK, ROCK], [ROCK, ROCK]);
    assert.deepEqual(allDrawn, { player1Wins: 0, player2Wins: 0, draws: 2, winner: 'draw' });
  });

  it('rejects instead of scoring a round the rules cannot resolve', async () => {
    const log: string[] = [];
    const player1 = scripted(log, 'P1', ['Rock', 'Rock']);
    const player2 = scripted(log, 'P2', ['Rock']);
    const game = new Game(player1, player2, { numberOfRounds: 1, numberOfHands: 2 }, new RecordingReporter(log));

    await assert.rejects(game.play(), /same length/);
  });
});
