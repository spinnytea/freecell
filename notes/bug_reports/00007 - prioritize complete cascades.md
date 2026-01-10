### Description

Change priorities to build on cascade on pile, rather than jumbled cards

## Labels

FIXME (gameplay)

### Game State 1

move b4 QD→KC

```text
 2C
 3C TD 3H KC 7S AC QH 6H
 AH 8C 5S    TH 6S TS KD
 8D 9S QC    2D 4C 9D AS
 5H 4H KS    JH KH 7D AD
 4S 3S QD    TC QS JS JC
 3D 2H       9H JD    9C
 2S          8S       8H
             7H       7C
             6C       6D
             5D       5C
                      4D
 move b3 QD→KS
:h shuffle32 29327
 56 58 4a 48 37 4b 43 24
 12 41 24 27 17 68 6c 46
 35 32 12 71 75 c4 b3
```

```text
 2C
 3C TD 3H KC 7S AC QH 6H
 AH 8C 5S    TH 6S TS KD
 8D 9S QC    2D 4C 9D AS
 5H 4H>KS    JH KH 7D AD
 4S 3S QD    TC QS JS JC
 3D 2H       9H JD    9C
 2S          8S       8H
             7H       7C
             6C       6D
             5D       5C
                      4D
 move b3 QD→KS
```

### Game State 2

move 25 8H→9S

```text
 KD KH    AS
 JC 9H 6S 7D KS 3C 4S 5H
 3H 5D QS 2S QH AH KC 2H
 AD 4C 5S 7H JS 6C 5C 8D
 3S 9D JD AC TH TC QC 8S
 QD    2D 7C 9S 2C 8C 7S
       6D 6H    3D 4H 4D
       TD JH
       9C TS
       8H
 move 23 8H→9C
:h shuffle32 26359
 24 53 5a 52 52 5b 5c a5
 25 15 23
```

```text
 KD KH    AS
 JC 9H 6S 7D KS 3C 4S 5H
 3H 5D QS 2S QH AH KC 2H
 AD 4C 5S 7H JS 6C 5C 8D
 3S 9D JD AC TH TC QC 8S
 QD    2D 7C 9S 2C 8C 7S
       6D 6H    3D 4H 4D
       TD JH
      >9C TS
       8H
 move 23 8H→9C
```
