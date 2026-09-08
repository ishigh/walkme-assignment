/**
 * Rock-Paper-Scissors rules: the hand list, the "beats" table and the pure
 * comparison functions. No I/O lives in this module.
 */

export const HANDS = ['Rock', 'Paper', 'Scissors'] as const;
export type Hand = (typeof HANDS)[number];

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

export type Outcome = 'player1' | 'player2' | 'draw';

export interface HandResult {
  player1: Hand;
  player2: Hand;
  winner: Outcome;
}

export interface RoundResult {
  hands: HandResult[];
  player1Wins: number;
  player2Wins: number;
  winner: Outcome;
}

export const compareHands = (player1: Hand, player2: Hand): Outcome => {
  if (player1 === player2) return 'draw';
  return BEATS[player1] === player2 ? 'player1' : 'player2';
};

/** The player who won more hands wins the round; equal counts are a draw. */
const roundWinner = (player1Wins: number, player2Wins: number): Outcome => {
  if (player1Wins === player2Wins) return 'draw';
  return player1Wins > player2Wins ? 'player1' : 'player2';
};

/** Compares two hand sets position by position; the player who wins more hands wins the round. */
export const compareHandSets = (player1Hands: readonly Hand[], player2Hands: readonly Hand[]): RoundResult => {
  if (player1Hands.length !== player2Hands.length) {
    throw new Error(
      `Hand sets must have the same length (player 1 has ${player1Hands.length}, player 2 has ${player2Hands.length})`,
    );
  }
  const hands = player1Hands.map((player1, index) => {
    const player2 = player2Hands[index];
    return { player1, player2, winner: compareHands(player1, player2) };
  });
  const player1Wins = hands.filter((hand) => hand.winner === 'player1').length;
  const player2Wins = hands.filter((hand) => hand.winner === 'player2').length;
  return { hands, player1Wins, player2Wins, winner: roundWinner(player1Wins, player2Wins) };
};
