import { GameHelper } from '../gameHelper.js';
import type { Hand } from '../game/rules.js';
import type { Player } from './player.js';

export class HumanPlayer implements Player {
  constructor(readonly name: string) {}

  getHands = async (numberOfHands: number): Promise<Hand[]> => {
    const hands: Hand[] = [];
    for (let index = 0; index < numberOfHands; index++) {
      const hand = await GameHelper.chooseHand(`${this.name}: choose hand (${index + 1}/${numberOfHands})`);
      hands.push(hand);
    }
    return hands;
  };
}
