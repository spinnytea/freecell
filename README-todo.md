# Code TODOs

```
\b((F)IXME|BUG|HACK|TODO|XXX|REVIEW|IDEA)\b
\b((F)IXME|BUG|HACK|TODO|XXX|REVIEW|IDEA)\b(\s+\([\w\d\-]+\))+
\b(BUG|HACK|TODO|XXX|REVIEW|IDEA)\b(\S|\s[^(])
\([5432]-priority\)
```

- [bug reports](./notes/bug_reports/template.md)
- [README-todo-labels.md](./README-todo-labels.md)

## Top-Level TODOs

> There isn't currently anything marked with a priority.
> Some next tasks could be:
>
> 1. actaully learn gsap, then do the `(refactor-timeline)`
>    - it would be nice to get the `useCardPositionAnimations` tests in good shape
>    - which might also lead into the "all action text" tests
> 2. `notes/bug_reports`
> 3. (settings) need to start the ui, and account for `new Freecell()`, `game._clone`
> 4. print/parse discrepancies for "non-standard" gameplay

- TODO (gsap) review how we use gsap, right now it feels like magic
- TODO (techdebt) switch from nextjs to vite
  - https://vite.dev/guide/build.html#multi-page-app
  - `defineConfig({ base: '/my-app/' })`
  - `import.*next`
    - `next/image`
    - `next/link`
    - `Metadata`
- REVIEW (deployment) [next.config.js Options](https://nextjs.org/docs/app/api-reference/next-config-js)
- REVIEW (techdebt) (refactor-rename) rename 'foundation' to 'home', 'auto-foundation' to …
  - I mistakenly used "home row" to mean cells + foundation
  - home is supposed to be where all the cards go to in the end "Home Cells"
  - foundation isn't a thing
  - ⋯
  - ¿tableau should be the _whole_ board, not just the cascades?
  - ¿cascade should be column?
  - ¿cell should be freecell? in the same way it should be ¿homecell?; maybe the that row is ¿thecells?
  - deck is fine
- TODO (optimize) (deployment) (gsap) IPad performance is kind of awful?
- TODO (motivation) (animation) movement needs to be fun, animations are important, every time a card moves, it must not jump
  - foundation -> deck
  - shuffle
  - deal each card
  - card flips (back -> face -> back)
  - cursor
  - selection
  - card movement
  - card drag animation (drag waggles the sequence)
  - auto-foundation each card
  - win -> init
- IDEA (motivation) (animation) animations by move type (same as previous)
  - first check all the cards that did move (updateCardPositions)
  - then check all the cards we expected to move based on actionText
  - then pick an animation based on PreviousActionType/actionText
    there's nuance to some of the PreviousActionType (e.g. variations on init/select)
  - if there's a mismatch, run the default animation
  - most actionTypes can use the default, esp at first
  ***
  - we are informally doing this for `move-foundation`
- TODO (motivation) (animation) (gsap) learn to use [greensock](https://css-tricks.com/how-to-animate-on-the-web-with-greensock/)
  - this is, in fact, the entire reason this project was started
- TODO (techdebt) (animation) The first animation after loading a page is still janky
  - it does the whole thing at once
  - which is normal for a "resize"
  - maybe it just doesn't have any "previous positions" available
  - still, there's got to be something we can do
- TODO (motivation) (flourish-anim) animate card flash for use in flourishes and end of game
  - blue, red, pink, etc
  - snazzy explosion when you place the last card
  - based on the image svg so we can do it with any card (king, ace, whatever)
  - maybe use it for the whole animation for a win when a flourish
  - verify/test animation replaces after deal + undo/deal
  - ⋯
  - currently, flashCards just does a "peek" effect, I want to add an actual animation effect
- IDEA (gameplay) (optional-complexity) Column surgery
  - swap two columns with invalid moves
  - swap cells (not too bad)
  - swap foundations (actually, that's easy)
  - need to replay game to ensure history is valid; swapping columns needs a note after the shuffle
  - `:h shuffle32 5, swap 21435678`
  - should this be a cosmetic "hud only" change? probably otherwise it will invalidate the whole game print
- TODO (motivation) (flourish-anim) extra pizzazz when it's a 52-card flourish
- TODO (settings) (undo) undo limit - all, until deal, until foundation (i.e. can never bring a card off foundation, even through undo), few, once, none
  - undo count starts at 0, increases with each move, clamps at 3, decreases with undo, can only undo if greater than 0
- TODO (settings) ensure that new game is always shuffled
  - GameContextProvider
  - every place we call new FreeCell (not tests)
- TODO (gameplay) (settings) hard vs medium vs easy
  - [FreeCell lists of difficult (and extra easy) deals](https://www.solitairelaboratory.com/fclists.html)
  - Some games require no free cells :D - so make a 0 cells version restricted to these games
  - Same with a list for solvable 1-cell games
- TODO (animation) animations after/during win state (celbration, like fireworks or card explosions)
- TODO (deployment) (settings) UI render for all options, hidden options, controls (keyboard, keyboard+selection, keyboard hotkeys, mouse click, mouse drag) w/ settings to enable/disable
- TODO (settings) disable "select-to-peek card" i.e. selecting cards that cannot move
  - could this simply be "autoMove().clear selection()"? (feels hacky)
  - need to disable when "peekOnly || !availableMoves?.length"
- TODO (deployment) (documentation) rules page (SUG) - separate from the manual testing
- IDEA (motivation) (joker) add joker to gameplay
  - high - any rank can stack onto them, they cannot be stacked on anything (color-fixed cascade)
  - low - they can stack onto any rank, but nothing can stack onto them (moving dead space)
  - wild - they can stack onto any rank, any rank can stack onto them
  - could have various counts 1-8; or maybe just 2 & 4
- IDEA (theme) sounds - normally i don't like to, but some folio for moving cards should be okay
- TODO (settings) (theme) more themes - card themes / decks / colors, background colors, etc
- TODO (motivation) (deployment) (offline) continue researching PWA (progressive web app), sing SW (service worker)
  - https://dev.to/stephengade/pwa-build-installable-nextjs-app-that-works-offline-3fff
  - Progressive Web App, using service workers
- REVIEW (techdebt) there are quite a few `eslint-disable` now
  - if we are going to have them, they should at least explain why
  - go back and either remove or explain them
  - ultimately we want to remove them, even if that's low priority or never
- TODO (anim-zindex) (animation) (gsap) If you undo too quickly, you can mess up zindex
  - properly chain speed up anim and/or reset zindex on complete?
- IDEA (gameplay) (settings) Alt rules: hard mode: move each and once (only only head of stack?)
  - e.g. 9H>TS, TS-9H>JH, but not then 9H>TC
  - may need to "grey" the card once moved
- IDEA (deployment) (hud) Game seeds in the url? Maybe we just put a new game + seed button?
  - What if the game in progress does not match the seed?
  - Maybe providing a game seed just redirects?
- IDEA (settings) boost the chance of a seed that allows flourish52
  - maybe with settings
  - there's only so many games (32000 games, 28839 florush, 19 flourish52), so repeats will be noticable
  - maybe 1 in 10 pick a random seed from the list?
- TODO (coords) (history) (parse) (print) (shorthandMove-mismatch) $moveCardToPile.test
  - shows move can differ from shorthanded: note that in the history, so we can parse it correctly
  - detect during parse? "invalid history ambiguous moves"
  - maybe there is a way to not it with certainty, like, with coords
    - replay the game when writing the history
    - and if the "shorthand" doesn't product the same coords
    - then write the coords into the history
- IDEA (parse) (print) more options
  - Print: HUD
  - Print History: Archive
  - Print Verbose: HUD + digest .…...... But history should have all this; we need notation for the gaps (e.g. cords when ambiguous history)
- IDEA (settings) disable "helpful" settings
  - e.g. click to move (picks "best" move for you)
  - e.g. flash flourish (you can do the math yourself)
- IDEA (gameplay) (hud) (settings) Dynamic metagame
  - score based
  - "fewest moves" and/or "unroll super moves"
  - shortest play time
  - jokers, randomly
- IDEA (gameplay) (undo) Undo… redo?
  - if you undo, show/enable a redo button
  - allows you to manually replay
- IDEA (motivation) (documentation) `/tutorial`
  - recreate the Game #5 documentation, forward linking back to original
- IDEA (motivation) (documentation) recreate other references?
  - like /tutorial, but we link to other Resources on the [README](./README.md#resources)
  - Partially duplication backup, partially deep verification
- TODO (motivation) (documentation) update `/manualtesting`
  - ensure current is accurate, review gaps/tasks
  - add (documentation) label

## Discarded TODOs

- preferred foundation suits? (HSDC) - render these?
  - i.e. instead of allowing any suit in any foundation spot, suits go in designated spots
  - this kind of goes against the whole flexible design
- getting fancy with the flourish animation was just BAD
  - if you slow it down, then you have to wait for it
  - it's already a hectic splash on the foundation, adding variation to top/left (sine.in vs sine.out) just adds chaos
  - same goes for things like "auto instant replay" at the end of the game. No. just click for new game please.
- restart animation as successive steps (like if you hold undo)
  - animation timing and game state is hard enough
  - i GUESS we could go through the trouble of doing it as one dirty great animation
  - but then you have to WAIT, you could just hold undo, but you opened the menu to go fast
