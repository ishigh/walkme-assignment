import { DEFAULT_GAME_SETTINGS, GameSettings } from '../game/gameSettings.js';

/** Command-line arguments as given: `key=value` tokens, keyed by `key`. */
export type ParsedArgs = ReadonlyMap<string, string>;

/**
 * Parses `key=value` tokens (pass `process.argv.slice(2)`). Generic: knows no key names.
 * Fails fast on anything that is not a well-formed, unique `key=value` pair:
 *  - a token without `=`, an empty key or an empty value throws;
 *  - a key given more than once throws (ambiguous input is an error; there is no "last one wins").
 * A token is split at its first `=`, so a value may itself contain `=`. Nothing is trimmed.
 */
export function parseArgs(tokens: readonly string[]): ParsedArgs {
  const args = new Map<string, string>();
  for (const token of tokens) {
    const separatorIndex = token.indexOf('=');
    if (separatorIndex === -1) {
      throw new Error(`Invalid argument "${token}": expected the form key=value`);
    }
    const key = token.slice(0, separatorIndex);
    const value = token.slice(separatorIndex + 1);
    if (key === '') {
      throw new Error(`Invalid argument "${token}": the key is empty`);
    }
    if (value === '') {
      throw new Error(`Invalid argument "${token}": the value for "${key}" is empty`);
    }
    if (args.has(key)) {
      throw new Error(`Argument "${key}" was given more than once`);
    }
    args.set(key, value);
  }
  return args;
}

/** Everything the entry point needs from the command line, validated. */
export interface CliOptions {
  readonly settings: GameSettings;
  /**
   * Player type exactly as typed on the command line (e.g. "Human", "CPU"), or undefined when not given -
   * the caller then prompts for it. The string itself is validated by the player factory, not here.
   */
  readonly player1Type?: string;
  readonly player2Type?: string;
}

/** The only keys the game accepts (they match the package.json scripts); anything else is a typo and is rejected. */
const ARG_KEYS = ['player1Type', 'player2Type', 'numberOfHands', 'numberOfRounds'] as const;
type ArgKey = (typeof ARG_KEYS)[number];

/** Digits only, no sign, no leading zero, no whitespace: "3" yes; "0", "-1", "+3", "03", "1.5", " 3", "3abc" no. */
const POSITIVE_INTEGER = /^[1-9]\d*$/;

/**
 * Reads the game options from `key=value` tokens (pass `process.argv.slice(2)`).
 * Fails fast on malformed tokens, duplicate or unknown keys, and numbers that are not positive integers.
 * `numberOfHands` / `numberOfRounds` are optional and fall back to DEFAULT_GAME_SETTINGS only when absent.
 */
export function readCliOptions(tokens: readonly string[]): CliOptions {
  const args = parseArgs(tokens);
  rejectUnknownKeys(args);
  const get = (key: ArgKey): string | undefined => args.get(key);

  return {
    settings: {
      numberOfHands: readPositiveInteger('numberOfHands', get('numberOfHands'), DEFAULT_GAME_SETTINGS.numberOfHands),
      numberOfRounds: readPositiveInteger('numberOfRounds', get('numberOfRounds'), DEFAULT_GAME_SETTINGS.numberOfRounds),
    },
    player1Type: get('player1Type'),
    player2Type: get('player2Type'),
  };
}

function rejectUnknownKeys(args: ParsedArgs): void {
  for (const key of args.keys()) {
    if (!(ARG_KEYS as readonly string[]).includes(key)) {
      throw new Error(`Unknown argument "${key}". Supported arguments: ${ARG_KEYS.join(', ')}`);
    }
  }
}

function readPositiveInteger(key: ArgKey, raw: string | undefined, defaultValue: number): number {
  if (raw === undefined) {
    return defaultValue; // optional setting: absent means "use the documented default"
  }
  if (!POSITIVE_INTEGER.test(raw)) {
    throw new Error(`Invalid value for ${key}: "${raw}". Expected a positive integer, e.g. ${key}=3`);
  }
  return Number(raw);
}
