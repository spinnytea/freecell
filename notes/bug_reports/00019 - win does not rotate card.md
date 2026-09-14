### Description

Drag and drop to flourish does not rotate the card.

Click-to-move is fine, drag and drop ... Clears selection? But rotation in gsap doesn't reset

## Labels

TODO (animation) (gsap) (flourish-anim)

### Game State

```text
expect(game.print()).toBe(
	'' + //
		'            >KH KC KS KD \n' +
		'                         \n' +
		':    Y O U   W I N !    :\n' +
		'                         \n' +
		' move 35 TD-9S-8H-7C-6D-5C-4D-3C-2D→JS (flourish 3558385756867858567578686576785865757867568 AD,2D,3C,3D,4C,4S,4D,5H,5C,5S,5D,6H,6C,6S,6D,7H,7C,7S,7D,8H,8C,8S,8D,9H,9C,9S,9D,TH,TC,TS,TD,JH,JC,JS,JD,QH,QC,QS,QD,KH,KC,KS,KD)'
);
```

```text
expect(game.print({ includeHistory: true })).toBe(
	'' + //
		'             KH KC KS KD \n' +
		'                         \n' +
		':    Y O U   W I N !    :\n' +
		'                         \n' +
		' move 35 TD-9S-8H-7C-6D-5C-4D-3C-2D→JS (flourish 3558385756867858567578686576785865757867568 AD,2D,3C,3D,4C,4S,4D,5H,5C,5S,5D,6H,6C,6S,6D,7H,7C,7S,7D,8H,8C,8S,8D,9H,9C,9S,9D,TH,TC,TS,TD,JH,JC,JS,JD,QH,QC,QS,QD,KH,KC,KS,KD)\n' +
		':h shuffle32 12981\n' +
		' 6h 81 34 68 23 53 23 27 \n' +
		' 72 72 62 74 43 4a 4b 4c \n' +
		' 42 c4 a4 b4 13 1a 12 6b \n' +
		' 16 16 b6 5b 52 51 52 61 \n' +
		' 21 34 7c 76 25 2c 25 b7 \n' +
		' 24 a4 c2 82 85 87 6a 58 \n' +
		' a5 35 38 32 23 73 17 46 \n' +
		' 3h 63 6h 78 35 '
);
```
