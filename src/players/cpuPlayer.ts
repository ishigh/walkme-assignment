import { HANDS, type Hand } from '../game/rules.js';
import type { Player } from './player.js';

/** Decides how many hands a CPU player draws when the game asks for `requested` hands. */
export type HandCountStrategy = (requested: number) => number;

/** The regular CPU draws every hand the game asks for. */
export const drawAll: HandCountStrategy = requested => requested;

/** A number in [0, 1), like `Math.random`. Injected so tests can make the draw deterministic. */
export type RandomSource = () => number;

/** Draws random hands. No I/O, so it can play unattended (CPU vs CPU) and be unit-tested. */
export class CpuPlayer implements Player {
  constructor(
    readonly name: string,
    private readonly handCount: HandCountStrategy,
    private readonly random: RandomSource
  ) {}

  getHands = async (numberOfHands: number): Promise<Hand[]> => {
    return Array.from({ length: this.handCount(numberOfHands) }, () => this.drawHand());
  };

  private drawHand(): Hand {
    return HANDS[Math.floor(this.random() * HANDS.length)];
  }
}
