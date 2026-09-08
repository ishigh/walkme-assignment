import type { Player } from '../players/player.js';
import type { GameSettings } from './gameSettings.js';
import { compareHandSets, winnerByWins, type Outcome, type RoundResult } from './rules.js';

/** The total score of a game: rounds won by each player, rounds drawn, and who won the game. */
export interface GameResult {
  player1Wins: number;
  player2Wins: number;
  draws: number;
  winner: Outcome;
}

/** Everything a game reports, in the order it happens. The game never prints; the reporter decides how. */
export interface GameReporter {
  roundStarted(roundNumber: number, numberOfRounds: number): void;
  roundFinished(round: RoundResult): void;
  gameFinished(result: GameResult): void;
}

/**
 * One game between two players: `settings.numberOfRounds` rounds of `settings.numberOfHands` hands each, with
 * the running total score kept on the instance. A `Game` is played once; create a new one to play again.
 *
 * Rounds are played strictly one after the other because a Human player answers prompts, and prompts cannot
 * overlap. Nothing in a round depends on an earlier round and the score is a plain tally of round results, so
 * when neither player needs input (CPU vs CPU, PDF 11.c.i) every round's `getHands` calls could be issued up
 * front and awaited together (`Promise.all`), then scored in order: the wait would be one draw, not one per round.
 */
export class Game {
  private player1Wins = 0;
  private player2Wins = 0;
  private draws = 0;

  constructor(
    private readonly player1: Player,
    private readonly player2: Player,
    private readonly settings: GameSettings,
    private readonly reporter: GameReporter
  ) {}

  async play(): Promise<GameResult> {
    for (let roundNumber = 1; roundNumber <= this.settings.numberOfRounds; roundNumber++) {
      this.reporter.roundStarted(roundNumber, this.settings.numberOfRounds);
      const round = await this.playRound();
      this.reporter.roundFinished(round);
    }
    const result = this.result();
    this.reporter.gameFinished(result);
    return result;
  }

  /** Player 1 draws before player 2 (so two Humans are prompted in turn), then the round is resolved and scored. */
  private async playRound(): Promise<RoundResult> {
    const player1Hands = await this.player1.getHands(this.settings.numberOfHands);
    const player2Hands = await this.player2.getHands(this.settings.numberOfHands);
    const round = compareHandSets(player1Hands, player2Hands);
    this.score(round);
    return round;
  }

  private score(round: RoundResult): void {
    if (round.winner === 'player1') this.player1Wins++;
    else if (round.winner === 'player2') this.player2Wins++;
    else this.draws++;
  }

  private result(): GameResult {
    const { player1Wins, player2Wins, draws } = this;
    return { player1Wins, player2Wins, draws, winner: winnerByWins(player1Wins, player2Wins) };
  }
}
