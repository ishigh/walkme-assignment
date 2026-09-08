/** Settings a single game runs with. Owned by the game domain; the CLI layer only produces them. */
export interface GameSettings {
  readonly numberOfRounds: number;
  readonly numberOfHands: number;
}

/** Assignment defaults (PDF / original skeleton), used only when a setting is absent from the command line. */
export const DEFAULT_GAME_SETTINGS: GameSettings = {
  numberOfRounds: 2,
  numberOfHands: 3,
};
