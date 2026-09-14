### Description

Animation is wrong

If you play 7a straight from a deal or refresh or restart, it doesn't animate the tween cards, both go to h in one animation instead of two - it DOES work from an undo

## Labels

TODO (animation) (gsap)

### Game State

```text
expect(game.print()).toBe(
	'' + //
		'>            2S          \n' +
		' JH 3D 7D 8C KS JS 9C 7H \n' +
		' KD JC 9H AC 5H KC 8D 4D \n' +
		' 6C TS 3C QD AH TC TH 3H \n' +
		' 4H AD QS 6H KH 5C QC 7S \n' +
		' 6S 2C 7C 8H 4C 5D    2D \n' +
		' 5S 9D 4S TD 3S JD    9S \n' +
		' 2H QH 6D 8S             \n' +
		' move 7a 2S→cell (auto-foundation 7a AS,2S)'
);
```

```text
expect(game.print({ includeHistory: true })).toBe(
	'' + //
		'             2S          \n' +
		' JH 3D 7D 8C KS JS 9C 7H \n' +
		' KD JC 9H AC 5H KC 8D 4D \n' +
		' 6C TS 3C QD AH TC TH 3H \n' +
		' 4H AD QS 6H KH 5C QC 7S \n' +
		' 6S 2C 7C 8H 4C 5D    2D \n' +
		' 5S 9D 4S TD 3S JD    9S \n' +
		' 2H QH 6D 8S             \n' +
		' move 7a 2S→cell (auto-foundation 7a AS,2S)\n' +
		':h shuffle32 11182\n' +
		' 7a '
);
```
