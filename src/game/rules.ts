/**
 * Rock-Paper-Scissors rules: the hand list, the "beats" table and the pure
 * comparison functions. No I/O lives in this module.
 */

export const HANDS = ['Rock', 'Paper', 'Scissors'] as const;
export type Hand = typeof HANDS[number];

/** Which hand each hand beats. Record<Hand, Hand> forces one entry per hand in HANDS. */
const BEATS: Record<Hand, Hand> = {
  Rock: 'Scissors',
  Scissors: 'Paper',
  Paper: 'Rock',
};

/** Boundary validation: turns an untrusted string (prompt / CLI) into a Hand, or throws. */
export const toHand = (value: string): Hand => {
  if (!(HANDS as readonly string[]).includes(value)) {
    throw new Error(`Invalid hand "${value}". Expected one of: ${HANDS.join(', ')}`);
  }
  return value as Hand;
};

export type PlayerSide = 'player1' | 'player2';
export type Outcome = PlayerSide | 'draw';

export interface HandResult {
  player1: Hand;
  player2: Hand;
  winner: Outcome;
}

/** The one hand a player brought to a round of several; it was played against each of the opponent's hands. */
export interface SingleHand {
  player: PlayerSide;
  hand: Hand;
}

export interface RoundResult {
  hands: HandResult[];
  player1Wins: number;
  player2Wins: number;
  winner: Outcome;
  /** Present only when the two sets differed in size (one player brought a single hand, the other several). */
  singleHand?: SingleHand;
}

export const compareHands = (player1: Hand, player2: Hand): Outcome => {
  if (player1 === player2) return 'draw';
  return BEATS[player1] === player2 ? 'player1' : 'player2';
};

/** Whoever won more (hands in a round, rounds in a game) wins; equal counts are a draw. */
export const winnerByWins = (player1Wins: number, player2Wins: number): Outcome => {
  if (player1Wins === player2Wins) return 'draw';
  return player1Wins > player2Wins ? 'player1' : 'player2';
};

/** Fail fast on sets no player produces: an empty set, or sizes that differ with neither being a single hand. */
const assertComparable = (player1Hands: readonly Hand[], player2Hands: readonly Hand[]): void => {
  const sizes = `(player 1 has ${player1Hands.length}, player 2 has ${player2Hands.length})`;
  if (player1Hands.length === 0 || player2Hands.length === 0) {
    throw new Error(`Hand sets must not be empty ${sizes}`);
  }
  if (player1Hands.length !== player2Hands.length && player1Hands.length !== 1 && player2Hands.length !== 1) {
    throw new Error(`Hand sets must have the same length unless one of them is a single hand ${sizes}`);
  }
};

/** The player, if any, who brought a single hand to a round of several. Assumes assertComparable passed. */
const findSingleHand = (player1Hands: readonly Hand[], player2Hands: readonly Hand[]): SingleHand | undefined => {
  if (player1Hands.length === player2Hands.length) return undefined;
  return player1Hands.length === 1
    ? { player: 'player1', hand: player1Hands[0] }
    : { player: 'player2', hand: player2Hands[0] };
};

/** A single hand is played at every position; a full set is taken position by position. */
const handAt = (hands: readonly Hand[], index: number): Hand => (hands.length === 1 ? hands[0] : hands[index]);

/**
 * Compares two hand sets; the player who wins more hands wins the round.
 * Sets of the same size are compared position by position. When one player brought a single hand to a round
 * of several (the Monkey), that hand is played against each of the opponent's hands, so the round still has
 * one comparison per opponent hand; `singleHand` says who and which hand. Anything else (an empty set, 2 vs 3)
 * is a bug in a player and throws.
 */
export const compareHandSets = (player1Hands: readonly Hand[], player2Hands: readonly Hand[]): RoundResult => {
  assertComparable(player1Hands, player2Hands);
  const hands = Array.from({ length: Math.max(player1Hands.length, player2Hands.length) }, (_, index) => {
    const player1 = handAt(player1Hands, index);
    const player2 = handAt(player2Hands, index);
    return { player1, player2, winner: compareHands(player1, player2) };
  });
  const player1Wins = hands.filter(hand => hand.winner === 'player1').length;
  const player2Wins = hands.filter(hand => hand.winner === 'player2').length;
  const round: RoundResult = { hands, player1Wins, player2Wins, winner: winnerByWins(player1Wins, player2Wins) };
  const singleHand = findSingleHand(player1Hands, player2Hands);
  return singleHand ? { ...round, singleHand } : round;
};
