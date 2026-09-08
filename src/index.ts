import { readCliOptions } from './cli/args.js';
import { GameHelper } from './gameHelper.js';
import type { Player } from './players/player.js';
import { createPlayer } from './players/playerFactory.js';
import { compareHandSets } from './game/rules.js';
import { announceRound } from './game/announcer.js';

const startGame = async (player1: Player, player2: Player, numberOfRounds: number, numberOfHands: number) => {
  const names = { player1: player1.name, player2: player2.name };

  for (let index = 0; index < numberOfRounds; index++) {
    console.log(`Round ${index + 1}/${numberOfRounds}:`);
    const p1Hands = await player1.getHands(numberOfHands);
    const p2Hands = await player2.getHands(numberOfHands);
    announceRound(compareHandSets(p1Hands, p2Hands), names);
  }
};

const run = async () => {
  const options = readCliOptions(process.argv.slice(2));
  const { numberOfRounds, numberOfHands } = options.settings;

  const player1Type = options.player1Type ?? (await GameHelper.choosePlayerType('Choose player 1 type'));
  const player2Type = options.player2Type ?? (await GameHelper.choosePlayerType('Choose player 2 type'));

  console.log(`Starting: ${player1Type} vs ${player2Type}, ${numberOfRounds} round(s) of ${numberOfHands} hand(s).`);

  const player1 = createPlayer(player1Type, 'Player 1');
  const player2 = createPlayer(player2Type, 'Player 2');
  await startGame(player1, player2, numberOfRounds, numberOfHands);

  console.log('Thanks for playing! Goodbye.');
};

run().catch((error: unknown) => {
  console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
