import inquirer from 'inquirer';
import { parseArgs } from './cli/args.js';
import { HANDS, toHand, type Hand } from './game/rules.js';
import { PLAYER_TYPES } from './players/player.js';

export class GameHelper {
  /** Offers exactly the types the player factory accepts; the factory validates the string, not this prompt. */
  static async choosePlayerType(message: string): Promise<string> {
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'choice',
        message,
        choices: PLAYER_TYPES,
      },
    ]);
    return answer.choice;
  }

  static async chooseHand(message: string): Promise<Hand> {
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'choice',
        message,
        choices: HANDS,
      },
    ]);
    return toHand(answer.choice);
  }

  /**
   * Returns the value of `key=value` from the command line, or undefined when the key was not given.
   * Generic: knows no key names. Delegates to the CLI parser so the token grammar lives in one place.
   * The entry point reads all options at once via `readCliOptions` (same parser) so that unknown keys
   * and invalid numbers are rejected together; this accessor is the per-key lookup the assignment names.
   */
  static getValueFromArgs(key: string): string | undefined {
    return parseArgs(process.argv.slice(2)).get(key);
  }
}
