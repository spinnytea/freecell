### Description

Animation is different after deal vs after undo

e.g. start new game, play the move
e.g. undo the move, play the move

It happens for both moves
`move 36 2H→3S (auto-foundation 16 AH,2H)`
and
`move 1h AH→foundation (auto-foundation 3 2H)`

## Labels

TODO (animation) (gsap)

### Game State

```text
expect(game.print()).toBe(
	'' + //
		'             2H          \n' +
		' 6H 9C 5H TS 6D QD 8C 8D \n' +
		' 7S AC 2C QC JH 7C 4S QS \n' +
		' 9H 3C 8S 3D AD AS JS 4H \n' +
		' 9S 2S 5C 7D 2D TD 4D KC \n' +
		' 5D 7H JD JC 4C TC 6S 5S \n' +
		' KS 8H KH 9D 3H>3S QH 6C \n' +
		'    KD    TH             \n' +
		' move 36 2H→3S (auto-foundation 16 AH,2H)'
);
```

```text
expect(game.print({ includeHistory: true })).toBe(
	'' + //
		'             2H          \n' +
		' 6H 9C 5H TS 6D QD 8C 8D \n' +
		' 7S AC 2C QC JH 7C 4S QS \n' +
		' 9H 3C 8S 3D AD AS JS 4H \n' +
		' 9S 2S 5C 7D 2D TD 4D KC \n' +
		' 5D 7H JD JC 4C TC 6S 5S \n' +
		' KS 8H KH 9D 3H 3S QH 6C \n' +
		'    KD    TH             \n' +
		' move 36 2H→3S (auto-foundation 16 AH,2H)\n' +
		':h shuffle32 14934\n' +
		' 36 '
);
```
