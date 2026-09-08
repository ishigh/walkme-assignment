import { readCliOptions } from './cli/args.js';
import { GameHelper } from './gameHelper.js';
import { createPlayer } from './players/playerFactory.js';
import { Game } from './game/game.js';
import { ConsoleReporter } from './game/consoleReporter.js';

const run = async () => {
  const options = readCliOptions(process.argv.slice(2));
  const { numberOfRounds, numberOfHands } = options.settings;

  const player1Type = options.player1Type ?? (await GameHelper.choosePlayerType('Choose player 1 type'));
  const player2Type = options.player2Type ?? (await GameHelper.choosePlayerType('Choose player 2 type'));
  const player1 = createPlayer(player1Type, 'Player 1');
  const player2 = createPlayer(player2Type, 'Player 2');

  console.log(`Starting: ${player1Type} vs ${player2Type}, ${numberOfRounds} round(s) of ${numberOfHands} hand(s).`);

  const reporter = new ConsoleReporter({ player1: player1.name, player2: player2.name });
  await new Game(player1, player2, options.settings, reporter).play();

  console.log('Thanks for playing! Goodbye.');
};

run().catch((error: unknown) => {
  console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
