# freecell

card game

[Play it now](https://spinnytea.bitbucket.io/freecell/)

[Coding Tasks](./README-todo.md)

## Technicals

Run the dev server: `npm start` and go to [http://localhost:3000](http://localhost:3000). Use `npm run fix` before commits. Use `npm test`.

Ready to release: `npm run build` and `npm run serve` (prebuild will `cleanup`, `format`, `lint`, and `test`)

Bump the version in package.json. Make and push version tags with `git tag v1.3.2` and `git push --tags`.

## Terms

**Foundation** - The four spaces to place cards, in order, from Ace - King. \
**Free Cells** - Four empty spaces to temporarily hold any card. \
**Tableau/Cascade** - The eight columns of cards on the playing board. Each column is a cascade, the whole lot is the tableau. \
**Run/Sequence** - noun, Sequences are built downward in decreasing rank, for example 4-3-2-A, 10-9-8-7-6, K-Q-J, etc. \
**Stack** - verb, to place a card or sequence on another card to sequence (note: use the noun _sequence_ instead)

# Resource

- Playing Card Deck https://code.google.com/archive/p/vector-playing-cards/
- This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) | [Next.js Documentation](https://nextjs.org/docs)
- Card Back: https://commons.wikimedia.org/wiki/File:Card_back_10.svg
- [Generate favicon from svg](https://svg2ico.com/)
- [Definitions of terms used in FreeCell](https://mobilityware.helpshift.com/hc/en/12-freecell/faq/3459-definitions-of-terms-used-in-freecell/)
- [FreeCell - Wikipedia](https://en.wikipedia.org/wiki/FreeCell)
