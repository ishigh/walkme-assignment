import { CpuPlayer, drawAll } from './cpuPlayer.js';
import { HumanPlayer } from './humanPlayer.js';
import { PLAYER_TYPES, type Player, type PlayerType } from './player.js';

/** One constructor per player type; Record<PlayerType, ...> keeps this table and PLAYER_TYPES in sync. */
const PLAYER_CREATORS: Record<PlayerType, (name: string) => Player> = {
  Human: name => new HumanPlayer(name),
  CPU: name => new CpuPlayer(name, drawAll, Math.random),
};

/** Boundary validation: turns an untrusted type string (prompt / CLI) into a player, or throws. */
export const createPlayer = (playerType: string, name: string): Player => {
  if (!(PLAYER_TYPES as readonly string[]).includes(playerType)) {
    throw new Error(`${name}: unknown player type "${playerType}". Expected one of: ${PLAYER_TYPES.join(', ')}`);
  }
  return PLAYER_CREATORS[playerType as PlayerType](name);
};
