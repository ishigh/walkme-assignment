import type { GameReporter, GameResult } from './game.js';
import type { Outcome, RoundResult } from './rules.js';

export interface PlayerNames {
  player1: string;
  player2: string;
}

/** Prints the game to the console: a header per round, a line per hand, the round result and the final score. */
export class ConsoleReporter implements GameReporter {
  constructor(private readonly names: PlayerNames) {}

  roundStarted(roundNumber: number, numberOfRounds: number): void {
    console.log(`Round ${roundNumber}/${numberOfRounds}:`);
  }

  roundFinished(round: RoundResult): void {
    const { player1, player2 } = this.names;
    if (round.singleHand) {
      const { player, hand } = round.singleHand;
      const [name, opponent] = player === 'player1' ? [player1, player2] : [player2, player1];
      console.log(`  ${name} plays a single hand (${hand}) against each of ${opponent}'s ${round.hands.length} hands`);
    }
    round.hands.forEach((hand, index) => {
      console.log(
        `  Hand ${index + 1}: ${player1} ${hand.player1} vs ${player2} ${hand.player2} -> ${this.describe(hand.winner)}`
      );
    });
    console.log(`  Hands won: ${player1} ${round.player1Wins}, ${player2} ${round.player2Wins}`);
    console.log(`  Round result: ${this.describe(round.winner)}`);
  }

  gameFinished(result: GameResult): void {
    const { player1, player2 } = this.names;
    console.log(
      `Final score: ${player1} ${result.player1Wins}, ${player2} ${result.player2Wins}, draws ${result.draws}`
    );
    console.log(`Game result: ${this.describe(result.winner)}`);
  }

  private describe(outcome: Outcome): string {
    return outcome === 'draw' ? 'draw' : `${this.names[outcome]} wins`;
  }
}
