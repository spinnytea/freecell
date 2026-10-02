### Description

Animation is different after deal vs after undo

e.g. start new game, play the move
e.g. undo the move, play the move

## Labels

TODO (animation) (gsap)

### Game State

```text
expect(game.print()).toBe(
	'' + //
		'             AD 2H AC    \n' +
		' JS 2D QD 2S 7D 7H TD AS \n' +
		' 8H TC 6D JC 2C 7C JD 5H \n' +
		' KD 8C 4S 8D JH 4C QH KC \n' +
		' QS 3H QC KH 9C 4H TS 6S \n' +
		' 9H 4D 9D 3S 6C    3C 8S \n' +
		' 5S TH 3D KS          9S \n' +
		' 5C>7S 5D                \n' +
		'    6H                   \n' +
		' move 72 6H→7S (auto-foundation 4566 AD,AH,2H,AC)'
);
```

```text
expect(game.print({ includeHistory: true })).toBe(
	'' + //
		'             AD 2H AC    \n' +
		' JS 2D QD 2S 7D 7H TD AS \n' +
		' 8H TC 6D JC 2C 7C JD 5H \n' +
		' KD 8C 4S 8D JH 4C QH KC \n' +
		' QS 3H QC KH 9C 4H TS 6S \n' +
		' 9H 4D 9D 3S 6C    3C 8S \n' +
		' 5S TH 3D KS          9S \n' +
		' 5C 7S 5D                \n' +
		'    6H                   \n' +
		' move 72 6H→7S (auto-foundation 4566 AD,AH,2H,AC)\n' +
		':h shuffle32 28478\n' +
		' 72 '
);
```
