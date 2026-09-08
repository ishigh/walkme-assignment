import type { Outcome, RoundResult } from './rules.js';

export interface PlayerNames {
  player1: string;
  player2: string;
}

const describeOutcome = (outcome: Outcome, names: PlayerNames): string =>
  outcome === 'draw' ? 'draw' : `${names[outcome]} wins`;

export const announceRound = (round: RoundResult, names: PlayerNames): void => {
  round.hands.forEach((hand, index) => {
    console.log(
      `  Hand ${index + 1}: ${names.player1} ${hand.player1} vs ${names.player2} ${hand.player2} -> ${describeOutcome(hand.winner, names)}`,
    );
  });
  console.log(`  Hands won: ${names.player1} ${round.player1Wins}, ${names.player2} ${round.player2Wins}`);
  console.log(`  Round result: ${describeOutcome(round.winner, names)}`);
};
