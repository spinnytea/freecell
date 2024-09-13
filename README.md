# freecell

card game

## Code TODOs

TODO main development tasks:

1. ~~Render cards~~
1. ~~Render playing field, card back(s)~~
1. ~~shuffle/deal cards~~
1. ~~click select -> click move (one card at a time, ¿no sequences?)~~
1. ~~win state~~
1. ~~quick and dirty loop (new -> shuffle -> deal -> play -> win -> <<-- new -> shuffle -> …)~~
1. ~~auto-foundation~~
1. one-click-to-move
1. everything (core game) is tested (ui selection -> move, all the way to winning)

\b(FIXME|TODO|XXX|REVIEW|IDEA)\b

- REVIEW [next.config.js Options](https://nextjs.org/docs/app/api-reference/next-config-js)
- TODO portrait vs landscape mode (portait on phone is ssoooooo small)
- TODO movement needs to be fun, animations are important, every time a card moves, it must not jump
  - deal each card
  - card flips (back -> face -> back)
  - cursor
  - selection
  - card movement
  - auto-foundation each card
- TODO failed moves shake
- TODO mouse controls
  - drag to move
  - click to move to "next best"
  - can we "select without moving"?
- TODO mouse drag-drop target is entire cascade
- TODO single click to move: one vs multiple - move to next option? - identify the _types_ of moves, not just _isAllowed_ - different moves have different priorities? (render debug info)
- TODO animate cards in flight should be above others
- TODO undo (move history) - all, few, one, none (should allow at least one undo, misclicks)
  - "Standard FreeCell Notation" (cell: a-d, foundation: h(ome), cascades: 1-8)
- TODO run drag/drop (drop target is entire cascade, drag waggles the sequence)
- TODO hard vs medium vs easy
  - [FreeCell lists of difficult (and extra easy) deals](https://www.solitairelaboratory.com/fclists.html)
  - Some games require no free cells :D - so make a 0 cells version restricted to these games
  - Same with a list for solvable 1-cell games
- IDEA option to dis/enable auto-foundation until all cascades are in order (all are a single sequence, or all are ascending)
- IDEA auto-foundation gets faster the longer it runs
- TODO can move cards during auto-foundation, stops when it gets to a card the user has moved (currently stops if the user has selected a card)
- TODO animations after/during win state
- IDEA toggle for: move sequence as one vs animate in-between steps (sequence moves vs each card moves)
- IDEA implement War? just so it's flexible?
- IDEA implement Spider Solitaire, that could be fun
- IDEA learn to use [greensock](https://css-tricks.com/how-to-animate-on-the-web-with-greensock/)
- TODO keyboard input (tab index, pick&place card&sequence, inspect card, shortcuts for top row)
- IDEA UI render for all options, hidden options, controls (keyboard + mouse)
- TODO rules page (SUG)
- IDEA joker
  - high - any rank can stack onto them, they cannot be stacked on anything (color-fixed cascade)
  - low - they can stack onto any rank, but nothing can stack onto them (moving dead space)
  - wild - they can stack onto any rank, any rank can stack onto them
  - could have various counts 1-8; or maybe just 2 & 4
- IDEA stats: # attempts (i don't like timers or move counts, but tracking resets is fine)
  - one set of undos = one restart?
  - spitball impl: attempts positive and negative, display Math.abs(attempts), set neg when undo, set pos and increase when move
- IDEA comments for all the rules? (or maybe that's too late now?)
- IDEA sounds - normally i don't like to, but some folio for moving cards should be okay

## Technicals

Run the dev server: `npm run dev` and go to [http://localhost:3000](http://localhost:3000).

Ready to release: `npm run build` and `npm run serve` (prebuild will `format`, `lint`, and `test`)

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
