# freecell

card game

## Code TODOs

TODO (motivation) main development tasks:

1. ~~Render cards~~
1. ~~Render playing field, card back(s)~~
1. ~~shuffle/deal cards~~
1. ~~click select -> click move (one card at a time, ¿no sequences?)~~
1. ~~win state~~
1. ~~quick and dirty loop (new -> shuffle -> deal -> play -> win -> <<-- new -> shuffle -> …)~~
1. ~~auto-foundation~~
1. ~~click-to-move~~
1. core game is tested + manual testing page (ui selection -> move, all the way to winning)

\b(FIXME|TODO|XXX|REVIEW|IDEA)\b
\b(FIXME|TODO|XXX|REVIEW|IDEA)\b\s+\((\w+)\)

- REVIEW (deployment) [next.config.js Options](https://nextjs.org/docs/app/api-reference/next-config-js)
- TODO (deployment) portrait vs landscape mode (portait on phone is ssoooooo small)
- TODO (motivation) movement needs to be fun, animations are important, every time a card moves, it must not jump
  - deal each card
  - card flips (back -> face -> back)
  - cursor
  - selection
  - card movement
  - card drag animation (drag waggles the sequence)
  - auto-foundation each card
- TODO (animation) failed moves shake
- TODO (controls) mouse drag to move - mouse drag-drop target is entire cascade
- TODO (controls) keyboard + selection
- TODO (animation) animate cards in flight should be above others
- TODO (gameplay) undo (move history) - all, few, one, none (should allow at least one undo, misclicks)
  - "Standard FreeCell Notation" (cell: a-d, foundation: h(ome), cascades: 1-8)
  - use move notation
  - play a game backward and forewards using move history
  - pay attention to sequences (probably need to look at the destination to pick the card from the source)
- TODO (gameplay) hard vs medium vs easy
  - [FreeCell lists of difficult (and extra easy) deals](https://www.solitairelaboratory.com/fclists.html)
  - Some games require no free cells :D - so make a 0 cells version restricted to these games
  - Same with a list for solvable 1-cell games
- IDEA (settings) option to dis/enable auto-foundation until all cascades are in order (all are a single sequence, or all are ascending)
- IDEA (animation) auto-foundation gets faster the longer it runs
- TODO (gameplay) can move cards during auto-foundation, stops when it gets to a card the user has moved (currently stops if the user has selected a card)
- TODO (animation) animations after/during win state
- IDEA (settings) toggle for: move sequence as one vs animate in-between steps (sequence moves vs each card moves)
- IDEA (motivation) implement War? just so it's flexible?
- IDEA (motivation) implement Spider Solitaire, that could be fun
- IDEA (animation) learn to use [greensock](https://css-tricks.com/how-to-animate-on-the-web-with-greensock/)
- TODO (controls) keyboard input (tab index, pick&place card&sequence, inspect card, shortcuts for top row)
- TODO (controls) keyboard hotkeys (1-8 (1234567890), abcd, h, ¿qwer?, ¿uiop?)
  - if cursor can stack with target: select, moveCard
  - if cursor cannot stack with target: setCursor
- IDEA (deployment) UI render for all options, hidden options, controls (keyboard, keyboard+selection, mouse click, mouse drag)
- TODO (deployment) rules page (SUG)
- IDEA (gameplay) joker
  - high - any rank can stack onto them, they cannot be stacked on anything (color-fixed cascade)
  - low - they can stack onto any rank, but nothing can stack onto them (moving dead space)
  - wild - they can stack onto any rank, any rank can stack onto them
  - could have various counts 1-8; or maybe just 2 & 4
- IDEA (gameplay) stats: # attempts (i don't like timers or move counts, but tracking resets is fine)
  - one set of undos = one restart?
  - spitball impl: attempts positive and negative, display Math.abs(attempts), set neg when undo, set pos and increase when move
- IDEA (theme) sounds - normally i don't like to, but some folio for moving cards should be okay
- TODO (theme) more themes - card themes / colors, background colors, etc

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
