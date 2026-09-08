# Advanced Rock-Paper-Scissors

A command-line Rock-Paper-Scissors game for two players. A game is played in **rounds**; in every round each player picks a set of **hands** (Rock, Paper or Scissors). Hands are compared position by position, and the player who wins more hands wins the round. A player who brings a single hand to a round of several (the Monkey) plays it against each of the opponent's hands.

## Installation
This project uses Yarn as package manager. To install all dependencies run
```
yarn install
```

## Running the game
```
yarn runGame
```
When a player type is not given on the command line, the game asks for it interactively.

### Player types
| Type    | Behaviour |
|---------|-----------|
| `Human` | Chooses every hand from a prompt in the terminal. |
| `CPU`   | Draws every hand at random, no interaction needed (can play against another `CPU`). |
| `Monkey` | Draws a single hand at random per round, whatever `numberOfHands` says, and plays it against each of the opponent's hands. |

### Command-line arguments
Arguments are `key=value` pairs. Unknown keys, malformed pairs, duplicates and non-positive numbers are rejected with an error.

| Argument         | Meaning                              | Default            |
|------------------|--------------------------------------|--------------------|
| `player1Type`    | Type of player 1 (see table above)   | asked interactively |
| `player2Type`    | Type of player 2                     | asked interactively |
| `numberOfHands`  | Hands each player picks per round    | `3`                |
| `numberOfRounds` | Rounds per game                      | `2`                |

Example: a human against the computer, 5 rounds of 1 hand each:
```
yarn runGame player1Type=Human player2Type=CPU numberOfRounds=5 numberOfHands=1
```

### Scripts
| Script               | What it does |
|----------------------|--------------|
| `yarn buildGame`     | Compiles TypeScript into `dist/`. |
| `yarn runGame`       | Builds and starts the game (accepts the arguments above). |
| `yarn runGameVsHuman`| Human vs Human. |
| `yarn runGameVsBot`  | Human vs CPU. |
| `yarn runGameVsMonkey` | Human vs Monkey. |
| `yarn lint`          | Runs ESLint with `--fix` (Prettier formatting included) over the sources. |

## Running the unit tests
The game, its rules and the players have unit tests that run on Node's built-in test runner (Node 22 or newer; developed on Node 24). Build first, then:
```
yarn buildGame
node --test "dist/src/**/*.test.js"
```

## Linting and formatting
ESLint and Prettier are configured in `.eslintrc.json` and `prettier.config.cjs` (restored from commit `6876245`). To check and auto-fix the sources:
```
yarn lint
```
A clean run prints nothing and changes no file.

## Discussion
Answers to the assignment's discussion questions are in [DISCUSSION.md](DISCUSSION.md).
