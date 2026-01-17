### Description

Undo: zIndex Animation order is wrong (need to zindex boost in flight)

## Labels

TODO (animation)

### Game State 1

undo

```text
       KH    4H 4S AH 2C
 7H 3S KS 3D QD QC    3C
 6S 9C KC 2D JC AS    AD
 6C 5D KD 8D TD 9S    5C
 6D 2H 5S       QS    JS
 QH TC 8S       5H    9D
 JH 4D TH       4C    7S
 JD    8H       3H    6H
 TS    7C       2S
 9H
 8C
 7D
 move 45 JC-TD→QD
:h shuffle32 7592
 5a 5b 5c 5d c5 65 73 46
 41 51 21 7c 78 76 46 74
 b5 45
```

```text
       KH    4H 4S AH 2C
 7H 3S KS 3D>QD QC    3C
 6S 9C KC 2D JC AS    AD
 6C 5D KD 8D TD 9S    5C
 6D 2H 5S       QS    JS
 QH TC 8S       5H    9D
 JH 4D TH       4C    7S
 JD    8H       3H    6H
 TS    7C       2S
 9H
 8C
 7D
 move 45 JC-TD→QD
```

### Game State 2

zIndex of cars in flight

undo/redo, JS goes under 6H

```test
 QC KD AH 2D AS 7H 4D 2H
 8D 4H TD 5H QS 8H JC TH
 3H 5D 9H 5S 5C TS 8C QH
 3D 3C AD JH 9C KC 6C 2S
 JD 9D AC 8S 6D 2C KS TC
 7S 4S 4C    7C KH QD
 7D 3S 9S    6H    JS
 6S
 move 47 JS→QD
:h shuffle32 7677
 81 45 47
```

```test
 QC KD AH 2D AS 7H 4D 2H
 8D 4H TD 5H QS 8H JC TH
 3H 5D 9H 5S 5C TS 8C QH
 3D 3C AD JH 9C KC 6C 2S
 JD 9D AC 8S 6D 2C KS TC
 7S 4S 4C    7C KH>QD
 7D 3S 9S    6H    JS
 6S
 move 47 JS→QD
```
