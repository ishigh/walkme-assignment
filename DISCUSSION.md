# Discussion

Answers to the DISCUSSION prompts of the assignment, tied to how this codebase is built.

## §7 — Improving the Human vs Human experience

Today both players share one keyboard and one screen, so player 2 sees every hand player 1 picked before choosing. Options, roughly in order of effort:

- **Hide the other player's picks.** Clear the screen between players and show a "pass the keyboard to Player 2" prompt, or take input through a masked (password-style) prompt so the choice never appears on screen. Cheapest and biggest win.
- **Reveal with suspense.** Collect both hand sets first, then reveal hand by hand with a short pause instead of dumping the whole round at once. `ConsoleReporter.roundFinished` already receives the full `RoundResult`, and `Game` never prints anything itself, so this is only a reporter change.
- **Names instead of "Player 1 / Player 2".** Ask for names at start; the `Player` interface already carries a `name`, so nothing else changes.
- **Running score.** Print the total score after every round, not only the round result (`Game` owns the tally; the reporter would receive it after each round).
- **Faster input.** Single-key hotkeys (`r` / `p` / `s`) instead of navigating a list with the arrow keys.
- **Play again.** Offer a rematch at the end instead of exiting.
- **Bigger step: separate devices.** Each player in their own terminal or browser over a socket. Because the game only ever calls `player.getHands(n)`, a `RemoteHumanPlayer` implementing the same `Player` interface would slot in without touching the game loop.

## §8a — Dealing with a crash

- **Fail fast at the boundaries, with clear messages.** Every untrusted input is validated where it enters: `parseArgs` / `readCliOptions` (command line), `toHand` (prompt answers), `createPlayer` (player type strings). Bad input throws immediately with a message that says what was expected, instead of being silently replaced by a default that would hide the problem.
- **One top-level handler, no swallowing below it.** `run().catch(...)` in `index.ts` is the only place that catches: it prints a friendly one-line error and sets a non-zero exit code so scripts and CI notice. Lower layers never catch-and-continue, so the process never runs on in an inconsistent state.
- **Catch what promises miss.** Register `process.on('unhandledRejection' | 'uncaughtException')` handlers that log and exit non-zero, so a bug outside the main chain cannot leave the process hanging.
- **Log enough to reproduce.** Print the stack trace (behind a debug flag) together with the settings the game ran with. Keep the rules pure and unit-tested (`rules.test.ts`), so crashes are confined to the I/O edges where they are easiest to diagnose.
- **Do not "recover" mid-crash.** Exit cleanly and let the user restart. Resuming an interrupted game is a separate concern, covered next.

## §8b — App closed in the middle of a game

- **Pick the unit of atomicity: a round.** A round either completes and counts, or it did not happen. Hands typed halfway through an interrupted round are discarded and that round is simply replayed.
- **Persist after every completed round.** Save a small JSON snapshot (player types, settings, results so far, score) to a file. On startup, if a snapshot exists, offer "resume or start a new game"; delete it when the game finishes.
- **Handle Ctrl+C gracefully.** Listen for `SIGINT`, print the current score, write the snapshot and exit with a clear message instead of dying mid-prompt.
- **Where it lives.** `Game` owns rounds and score, so save/restore belongs there. Players stay unaware of persistence, and the pure rules are untouched.

## §11.c.i — CPU vs CPU without waiting round by round

`Player.getHands` returns a `Promise`, and `CpuPlayer` does no I/O, so its draws can overlap:

- **Run the rounds concurrently.** Instead of the sequential loop in `Game.play` / `playRound` (`await` player 1, `await` player 2, report, next round), start every round at once: for each round, `Promise.all([player1.getHands(n), player2.getHands(n)])`, and wrap all rounds in one more `Promise.all`. If a draw takes ~x, the whole game takes ~x instead of rounds × x.
- **It is safe because rounds are independent.** `compareHandSets` is pure and a round's outcome does not depend on earlier rounds, so the order of completion does not matter; results are compared and announced after everything resolved.
- **Go further: one draw for the whole game.** Ask each CPU for `numberOfRounds × numberOfHands` hands in a single call and slice the result into rounds, paying x once.
- **Keep humans sequential.** A `HumanPlayer` prompts on the terminal, so its rounds must stay in order. `Game` can choose the concurrent path when neither player is interactive, or the players can expose that fact themselves. The doc comment on `Game` records this option.
