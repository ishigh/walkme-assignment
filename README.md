## Installation
This project uses Yarn as package manager. To install all dependencies run
```
yarn install
```

## Local development
To run the game, use the provided command
```
yarn runGame
```

## Running the unit tests
The game rules and the players have unit tests that run on Node's built-in test runner. Build first, then:
```
node --test "dist/src/**/*.test.js"
```