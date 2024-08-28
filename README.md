# freecell

card game

## Code TODOs

TODO main development tasks:

1. ~~Render cards~~
1. ~~Render playing field, card back(s)~~
1. ~~shuffle/deal cards~~
1. click select -> click move (one card at a time, ¿no sequences?)
1. win state
1. everything (core game) is tested

\b(FIXME|TODO|XXX|REVIEW|IDEA)\b

- REVIEW `src/app/common.module.css`
- TODO movement needs to be fun, animations are important, every time a card moves, it must not jump
- TODO failed moves shake
- TODO single click to move: one vs multiple - move to next option? - identify the _types_ of moves, not just _isAllowed_ - different moves have different priorities? (render debug info)
- TODO undo (move history) - all, few, one, none (should allow at least one undo, misclicks)
- TODO run drag/drop (drop target is entire stack, drag waggles the stack)
- TODO hard vs medium vs easy
- TODO auto-solver stops when
  - (bad) all cards that can go up (i.e. 2229)
  - current rank + 1.5 (3s are set, all the 4s and 5s, red 6s IFF black 5s are up, i.e. 3565) (all not needed for stacking, opp rank + 1))
  - current rank + 1 (3s are set, all the 4s and 5s, but not 6s, i.e. 3555)
  - current rank (3s are set, all the 4s before any 5, i.e. 3444)
  - option to dis/enable until all cascades are in order (all are a single sequence, or all are ascending)
  - demo these with solved-sorted (4 full stacks, but H & S, D & C)
- IDEA auto-solve gets faster the longer it runs
- TODO can move cards during auto-solver, stops when it gets to a card the user has moved (can start with: stops as soon as a user does a thing)
- IDEA toggle for: move stack as one vs animate in-between steps (stack moves vs each card moves)
- IDEA implement War? just so it's flexible?
- IDEA implement Spider Solitaire, that could be fun
- IDEA learn to use [greensock](https://css-tricks.com/how-to-animate-on-the-web-with-greensock/)
- TODO keyboard input (tab index, pick/place card/stack, inspect card, shortcuts for top row)
- IDEA UI render for all options, hidden options, controls (keyboard + mouse)

## Technicals

Run the dev server: `npm run dev` and go to [http://localhost:3000](http://localhost:3000).

## Terms

**Foundation** - The four spaces to place cards, in order, from Ace - King. \
**Free Cells** - Four empty spaces to temporarily hold any card. \
**Tableau/Cascade** - The eight columns of cards on the playing board. Each column is a cascade, the whole lot is the tableau. \
**Run/Sequence** - Sequences are built downward in decreasing rank, for example 4-3-2-A, 10-9-8-7-6, K-Q-J, etc.

# Resource

- Playing Card Deck https://code.google.com/archive/p/vector-playing-cards/
- This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) | [Next.js Documentation](https://nextjs.org/docs)
- Card Back: https://commons.wikimedia.org/wiki/File:Card_back_10.svg
- [Generate favicon from svg](https://svg2ico.com/)
- [Definitions of terms used in FreeCell](https://mobilityware.helpshift.com/hc/en/12-freecell/faq/3459-definitions-of-terms-used-in-freecell/)
- [FreeCell - Wikipedia](https://en.wikipedia.org/wiki/FreeCell)
