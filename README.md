# freecell

card game

## Code TODOs

TODO main development tasks:

1. ~~Render cards~~
1. Render playing field, card back(s)
1. shuffle/deal cards [Deal cards for FreeCell](https://rosettacode.org/wiki/Deal_cards_for_FreeCell)
1. click select -> click move
1. win state
1. everything (core game) is tested

\b(FIXME|TODO|XXX|REVIEW|IDEA)\b

- TODO replace `src/app/favicon.ico`
- REVIEW `src/app/globals.css`
- REVIEW `src/app/common.module.css`
- REVIEW what are the names of the things (foundation? cascade? cell?)
- TODO movement needs to be fun, animations are important, every time a card moves, it must not jump
- TODO failed moves shake
- TODO single click to move: one vs multiple - move to next option? - identify the _types_ of moves, not just _isAllowed_ - different moves have different priorities? (render debug info)
- TODO undo (move history) - all, few, one, none
- TODO run drag/drop (drop target is entire stack, drag waggles the stack)
- TODO hard vs medium vs easy
- TODO auto-solver stops when
	- (bad) all cards that can go up
	- all not needed for stacking (rank-opp+1?) (e.g. 0222, 1333)
	- current rank + 1
	- current rank
- IDEA auto-solve gets faster the longer it runs
- TODO can move cards during auto-solver, stops when it gets to a card the user has moved (can start with: stops as soon as a user does a thing)
- IDEA toggle for: move stack as one vs animate in-between steps (stack moves vs each card moves)
- IDEA implement War? just so it's flexible?
- IDEA implement Spider Solitaire, that could be fun
- IDEA learn to use [greensock](https://css-tricks.com/how-to-animate-on-the-web-with-greensock/)
- TODO keyboard input (tab index, pick/place card/stack, inspect card, shortcuts for top row)

## Technicals

Run the dev server: `npm run dev` and go to [http://localhost:3000](http://localhost:3000).

# Resource

- Playing Card Deck https://code.google.com/archive/p/vector-playing-cards/
- This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) | [Next.js Documentation](https://nextjs.org/docs)
- Card Back: https://commons.wikimedia.org/wiki/File:Card_back_10.svg
