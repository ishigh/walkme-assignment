import type { Hand } from '../game/rules.js';

/** A participant in a game: the game only ever asks a player for its hands. */
export interface Player {
  readonly name: string;
  getHands(numberOfHands: number): Promise<Hand[]>;
}

/** Player types as spelled on the command line (`player2Type=CPU`, see the package.json scripts). */
export const PLAYER_TYPES = ['Human', 'CPU', 'Monkey'] as const;
export type PlayerType = typeof PLAYER_TYPES[number];
