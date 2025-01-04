# freecell

card game

[Play it now](https://spinnytea.bitbucket.io/freecell/)

## Code TODOs

TODO (motivation) main development tasks:

1. ~~legible `(cards)` for mobile~~
1. ~~move `(history)` & undo~~
1. ~~`(animation)` https://gsap.com/resources/React/ - just basic animations, like, "stagger" the card movements~~
1. `(drag-and-drop)` (click-to-move has been working, but sometimes you need to "force" the move you want)
1. `(newgame)` local storage, new button

```
\b((F)IXME|BUG|TODO|XXX|REVIEW|IDEA)\b
\b((F)IXME|BUG|TODO|XXX|REVIEW|IDEA)\b(\s+\(\w+\))+
\b(BUG|TODO|XXX|REVIEW|IDEA)\b\s+[^(]
\((\d+)-priority\)
```

## Top-Level TODOs

- TODO (more-undo) (4-priority) undo all the back to start
  - new games can start with a shuffle, so we don't need to click through that (unit test it / unit test history)
  - undo before deal
  - undo before shuffle
  - touch deck to shuffle
  - animate shuffle
- REVIEW (deployment) [next.config.js Options](https://nextjs.org/docs/app/api-reference/next-config-js)
- TODO (deployment) portrait vs landscape mode (portait on phone is ssoooooo small)
- TODO (motivation) movement needs to be fun, animations are important, every time a card moves, it must not jump
  - foundation -> deck
  - shuffle
  - deal each card
  - card flips (back -> face -> back)
  - cursor
  - selection
  - card movement
  - card drag animation (drag waggles the sequence)
  - auto-foundation each card
- TODO (mobile) icons for bookmarks / save link to home screen (Andriod, iOS)
- REVIEW (animation) when dealing or auto-foundation, do we "stop at any time" or "skip animation just get to the end state" (is this a setting?)
- TODO (motivation) animate card flash for use in flourishes and end of game
  - blue, red, pink, etc
  - snazzy explosion when you place the last card
  - based on the image svg so we can do it with any card (king, ace, whatever)
  - maybe use it for the whole animation for a win when a flourish
- TODO (animation) failed moves shake
- REVIEW (animation) finish card move animation before autoFoundationAll starts
- TODO (drag-and-drop) mouse drag to move - mouse drag-drop target is entire cascade
- TODO (controls) keyboard + selection
- TODO (animation) animate cards in flight should be above others
- TODO (settings) undo limit - all, until foundation (i.e. can never bring a card off foundation, even through undo), few, once, none
- TODO (gameplay) hard vs medium vs easy
  - [FreeCell lists of difficult (and extra easy) deals](https://www.solitairelaboratory.com/fclists.html)
  - Some games require no free cells :D - so make a 0 cells version restricted to these games
  - Same with a list for solvable 1-cell games
- TODO (settings) once move history is in game.print, save completed games to local storage and/or print to console (this way we can "recover" the last one after we finish, if we accidentally start a new one before we can snapshot it / archive it) - we only need the one for this
- TODO (gameplay) (newgame) (4-priority) new game button (esp before saving current game to local storage to persist across page reloads)
- TODO (gameplay) (newgame) (settings) (4-priority) store current game so it survives page refresh
  - i keep hitting the "back" button on accident (swip from size of screen)
- IDEA (settings) option to dis/enable auto-foundation until all cascades are in order (all are a single sequence, or all are ascending)
- IDEA (animation) auto-foundation gets faster the longer it runs
- TODO (animation) (gameplay) can move cards during auto-foundation, stops when it gets to a card the user has moved (currently stops if the user has selected a card)
- TODO (animation) animations after/during win state (celbration)
- IDEA (settings) toggle for: move sequence as one vs animate in-between steps (sequence moves vs each card moves)
- IDEA (motivation) implement War? just so it's flexible?
- IDEA (motivation) implement Spider Solitaire, that could be fun
- TODO (animation) learn to use [greensock](https://css-tricks.com/how-to-animate-on-the-web-with-greensock/)
- IDEA (controls) catch a card in-flight
- TODO (controls) keyboard hotkeys (1-8 (1234567890), abcd, h, ¿qwerty?, ¿uiop?)
  - if cursor can stack with target: select, moveCard
  - if cursor cannot stack with target: setCursor
- TODO (deployment) UI render for all options, hidden options, controls (keyboard, keyboard+selection, keyboard hotkeys, mouse click, mouse drag) w/ (settings) to enable/disable
- TODO (settings) disable "select/peek card" i.e. selecting cards that cannot move
- TODO (deployment) rules page (SUG)
- IDEA (joker) add joker to gameplay
  - high - any rank can stack onto them, they cannot be stacked on anything (color-fixed cascade)
  - low - they can stack onto any rank, but nothing can stack onto them (moving dead space)
  - wild - they can stack onto any rank, any rank can stack onto them
  - could have various counts 1-8; or maybe just 2 & 4
- IDEA (gameplay) stats: # attempts (i don't like timers or move counts, but tracking resets is fine)
  - one set of undos = one restart?
  - spitball impl: attempts positive and negative, display Math.abs(attempts), set neg when undo, set pos and increase when move
- IDEA (theme) sounds - normally i don't like to, but some folio for moving cards should be okay
- TODO (theme) more themes - card themes / colors, background colors, etc
- IDEA (deployment) download on android: "play offline"
  - single html file? try testing that first (javascript + svg)
- XXX (techdebt) optimize
  - react keeps reinitializing cards, messing with animations
  - i've never benchmarked memory/speed before in any meaningful way
  - is the game impl even a problem? prove that there are no memory leeks (maybe print/parse proves it)
- REVIEW (techdebt) there are quite a few `eslint-disable` now
  - if we are going to have them, they should at least explain why
  - go back and either remove or explain them
  - ultimately we want to remove them, even if that's low priority or never
- REVIEW (techdebt) (hud) double check layout on:
  - macbook chrome
  - ipad safari
  - android chrome

## Technicals

Run the dev server: `npm start` and go to [http://localhost:3000](http://localhost:3000). Use `npm run fix` before commits. Use `npm test`.

Ready to release: `npm run build` and `npm run serve` (prebuild will `cleanup`, `format`, `lint`, and `test`)

Bump the version in package.json. Make and push version tags with `git tag v1.3.2` and `git push origin refs/tags/v1.3.2`.

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
