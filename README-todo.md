# Code TODOs

```
\b((F)IXME|BUG|TODO|XXX|REVIEW|IDEA)\b
\b((F)IXME|BUG|TODO|XXX|REVIEW|IDEA)\b(\s+\(\w+\))+
\b(BUG|TODO|XXX|REVIEW|IDEA)\b(\S|\s[^(])
\([5432]-priority\)
```

## Top-Level TODOs

- TODO (gsap) review how we use gsap, right now it feels like magic
- TODO (techdebt) switch from nextjs to vite
  - https://vite.dev/guide/build.html#multi-page-app
  - `defineConfig({ base: '/my-app/' })`
  - `import.*next`
    - `next/image`
    - `next/link`
    - `Metadata`
- REVIEW (deployment) [next.config.js Options](https://nextjs.org/docs/app/api-reference/next-config-js)
- REVIEW (techdebt) rename 'foundation' to 'home', 'auto-foundation' to …
  - I mistakenly used "home row" to mean cells + foundation
  - home is supposed to be where all the cards go to in the end "Home Cells"
  - foundation isn't a thing
  - ⋯
  - ¿tableau should be the _whole_ board, not just the cascades?
  - ¿cascade should be column?
  - ¿cell should be freecell? in the same way it should be ¿homecell?; maybe the that row is ¿thecells?
  - deck is fine
- TODO (deployment) (gsap) IPad performance is kind of awful?
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
- TODO (motivation) (animation) (gsap) learn to use [greensock](https://css-tricks.com/how-to-animate-on-the-web-with-greensock/)
- TODO (techdebt) (animation) The first animation after loading a page is still janky
  - it does the whole thing at once
  - which is normal for a "resize"
  - maybe it just doesn't have any "previous positions" available
  - still, there's got to be something we can do
- REVIEW (hud) (mobile) icon for bookmarks / save link to home screen (Andriod, iOS)
- TODO (flourish-anim) (motivation) animate card flash for use in flourishes and end of game
  - blue, red, pink, etc
  - snazzy explosion when you place the last card
  - based on the image svg so we can do it with any card (king, ace, whatever)
  - maybe use it for the whole animation for a win when a flourish
  - verify/test animation replaces after deal + undo/deal
  - ⋯
  - currently, flashCards just does a "peek" effect, I want to add an actual animation effect
- IDEA (gameplay) Column surgery
  - swap two columns with invalid moves
  - swap cells (not too bad)
  - swap foundations (actually, that's easy)
  - need to replay game to ensure history is valid; swapping columns needs a note after the shuffle
  - `:h shuffle32 5, swap 21435678`
- TODO (flourish-anim) (motivation) extra pizzazz when it's a 52 card flourish
- TODO (settings) (undo) undo limit - all, until deal, until foundation (i.e. can never bring a card off foundation, even through undo), few, once, none
- TODO (settings) ensure that new game is always shuffled
  - GameContextProvider
  - every place we call new FreeCell (not tests)
- TODO (gameplay) hard vs medium vs easy
  - [FreeCell lists of difficult (and extra easy) deals](https://www.solitairelaboratory.com/fclists.html)
  - Some games require no free cells :D - so make a 0 cells version restricted to these games
  - Same with a list for solvable 1-cell games
- IDEA (settings) option to dis/enable auto-foundation until all cascades are in order (all are a single sequence, or all are ascending)
- IDEA (animation) auto-foundation gets faster the longer it runs
- TODO (animation) animations after/during win state (celbration)
- IDEA (settings) toggle for: move sequence as one vs animate in-between steps (sequence moves vs each card moves)
- IDEA (animation) (motivation) instant replay after game is over
- IDEA (motivation) implement War? just so it's flexible?
  - what is "it", the UI? the controls?
- IDEA (motivation) implement Spider Solitaire, that could be fun
- TODO (controls) mouse column mode (like keyboard hotkeys)
- TODO (deployment) UI render for all options, hidden options, controls (keyboard, keyboard+selection, keyboard hotkeys, mouse click, mouse drag) w/ (settings) to enable/disable
- TODO (settings) disable "select-to-peek card" i.e. selecting cards that cannot move
  - could this simply be "autoMove().clear selection()"? (feels hacky)
  - need to disable when "peekOnly || !availableMoves?.length"
- TODO (deployment) rules page (SUG) - separate from the manual testing
- IDEA (joker) add joker to gameplay
  - high - any rank can stack onto them, they cannot be stacked on anything (color-fixed cascade)
  - low - they can stack onto any rank, but nothing can stack onto them (moving dead space)
  - wild - they can stack onto any rank, any rank can stack onto them
  - could have various counts 1-8; or maybe just 2 & 4
- IDEA (gameplay) stats: # attempts (i don't like timers or move counts, but tracking resets is fine)
  - one set of undos = one restart?
  - spitball impl: attempts positive and negative, display Math.abs(attempts), set neg when undo, set pos and increase when move
- IDEA (theme) sounds - normally i don't like to, but some folio for moving cards should be okay
- TODO (theme) more themes - card themes / decks / colors, background colors, etc
- IDEA (techdebt) (deployment) (offline) (refactor) re-package as an android app?
- IDEA (2-priority) (deployment) (offline) download on android: "play offline"
  - single html file? try testing that first (javascript + svg)
  - airplane mode?
  - https://dev.to/stephengade/pwa-build-installable-nextjs-app-that-works-offline-3fff
  - Progressive Web App, using service workers
  - What I already have should work, android is just dumb
- XXX (techdebt) optimize
  - i've never benchmarked memory/speed before in any meaningful way
  - is the game impl even a problem? prove that there are no memory leeks (maybe print/parse proves it)
  - deff code cleanup, some of the code is ugly; some is still at "make it work and move on"
- REVIEW (techdebt) there are quite a few `eslint-disable` now
  - if we are going to have them, they should at least explain why
  - go back and either remove or explain them
  - ultimately we want to remove them, even if that's low priority or never
- REVIEW (techdebt) (hud) double check layout on:
  - macbook chrome
  - ipad safari
  - android chrome
- TODO (techdebt) [bug reports](./notes/bug_reports/template.md)

## Discarded TODOs

- preferred foundation suits? (HSDC) - render these?
  - i.e. instead of allowing any suit in any foundation spot, suits go in designated spots
  - this kind of goes against the whole flexible design
