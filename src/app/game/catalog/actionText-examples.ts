export const FIFTY_TWO_CARD_FLOURISH =
	'move 3b 8S→cell (flourish 33357d226765475665745627157ab15775185187781581571578 AS,AD,AC,2S,2D,2C,3D,AH,2H,3S,3C,3H,4S,4D,4C,4H,5S,5D,5C,5H,6S,6D,6C,6H,7S,7D,7C,7H,8S,8D,8C,8H,9S,9D,9C,9H,TS,TD,TC,TH,JS,JD,JC,JH,QS,QD,QC,QH,KS,KD,KC,KH)';

/**
	these are <action> -> <state immediately before the action>

	that is to say, here is a game state, where, we can apply this specific action
*/
export const ACTION_TEXT_EXAMPLES: Record<string, string> = {
	'init': '', // we cannot "take an action" to make an init
	'init with invalid history': '', // we cannot "take an action" to make an init with invalid history
	'init partial': '',
	// 'hand-jammed': '', // XXX (techdebt) as much as this isn't _supposed_ to be supported, it kind of is part of the tests now
	'shuffle deck (0)':
		'                         \n' +
		'                         \n' +
		':d KS KH KD KC QS QH QD QC JS JH JD JC TS TH TD TC 9S 9H 9D 9C 8S 8H 8D 8C 7S 7H 7D 7C 6S 6H 6D 6C 5S 5H 5D 5C 4S 4H 4D 4C 3S 3H 3D 3C 2S 2H 2D 2C AS AH AD AC ',
	'deal all cards': '',
	'deal most cards': '',
	'cursor set': '',
	'cursor up': '',
	'cursor left': '',
	'cursor down': '',
	'cursor right': '',
	'cursor up w': '',
	'cursor left w': '',
	'cursor down w': '',
	'cursor right w': '',
	'cursor stop': '',
	'select QS': '',
	'select 4D-3S-2D': '',
	'select 8 7C': '',
	'select 8 4D-3S-2D': '',
	'deselect AS': '',
	'deselect 4D-3S-2D': '',
	'deselect 6 2D': '',
	'deselect 6 4D-3S-2D': '',
	'touch stop': '',
	'move 3a KC→cell':
		'             AD 3C 4H 3S \n' +
		' QH TS 2D 7C 4C 7D QC KH \n' +
		' JC 9D 9C 6H 4D 6C JD QS \n' +
		' TH 8C KC 5S KD 5H    JH \n' +
		'             8H 4S    TC \n' +
		'             KS 3D    9H \n' +
		'             QD       8S \n' +
		'             JS       7H \n' +
		'             TD       6S \n' +
		'             9S       5D \n' +
		'             8D          \n' +
		'             7S          \n' +
		'             6D          \n' +
		'             5C          \n' +
		' move 37 JD→QC\n' +
		':h shuffle32 5\n' +
		' 53 6a 65 67 85 a8 68 27 \n' +
		' 67 1a 1b 13 15 a5 1a 1c \n' +
		' 86 85 86 86 21 25 2b 27 \n' +
		' 42 45 c5 42 47 4h 48 48 \n' +
		' 78 7c 7h 71 78 7h ah b8 \n' +
		' 34 31 32 c7 37 ',
	'move 8h AD→foundation': '',
	'move 57 KS→cascade': '',
	'move 23 KC-QD-JS→cascade':
		'             QC TD KH 9S \n' +
		' QS KC       TS          \n' +
		' JD QD       KS          \n' +
		' KD JS                   \n' +
		' hand-jammed',
	'move 15 TD→JS':
		' 9S 2H       AD 2C       \n' +
		' AH 8S 2D QS 4C    2S 3D \n' +
		' 5C AS 9C KH 4D    3C 4S \n' +
		' 3S 5D KC 3H KD    6S 8D \n' +
		' TD 7S JD 7H 8H    JC 7D \n' +
		'    QH 8C 9D KS    4H 6C \n' +
		'       TH 6D QD    QC 5H \n' +
		'       7C TS JS    JH    \n' +
		'       6H          TC    \n' +
		'       5S          9H    \n' +
		' move 13 5S→6H\n' +
		':h shuffle32 5\n' +
		' 53 6a 65 67 85 a8 68 27 \n' +
		' 67 1a 1b 13 ',
	'move 78 JH-TC-9H-8S-7H→QS': '',
	'move 53 6H→7C (auto-foundation 2 AD)':
		'                         \n' +
		' AH 8S 2D QS 4C 9H 2S 3D \n' +
		' 5C AS 9C KH 4D 2C 3C 4S \n' +
		' 3S 5D KC 3H KD 5H 6S 8D \n' +
		' TD 7S JD 7H 8H JH JC 7D \n' +
		' 5S QH 8C 9D KS QD 4H AC \n' +
		' 2H TC TH 6D 6H 6C QC JS \n' +
		' 9S AD 7C TS             \n' +
		' deal all cards\n' +
		':h shuffle32 5',
	'move 14 2S→3D (auto-foundation 14 AS,2S)':
		'    3H 8D 4D AC 2D AH    \n' +
		' AS JC 9D 9C KD KC KS 5C \n' +
		' 2S JD 8S 4C QS    QH 2H \n' +
		'    6D 7D 3C       JS TD \n' +
		'    6H 6C 7S       TH 9S \n' +
		'    QC 5H QD          2C \n' +
		'    KH    TS          5S \n' +
		'    8H    JH          4H \n' +
		'    7C    TC          3S \n' +
		'          9H             \n' +
		'          8C             \n' +
		'          7H             \n' +
		'          6S             \n' +
		'          5D             \n' +
		'          4S             \n' +
		'          3D             \n' +
		' move 16 KC→cascade\n' +
		':h shuffle32 2107\n' +
		' 64 62 6a 6b 3c 34 14 74 \n' +
		' 34 38 3d 34 18 15 73 71 \n' +
		' 73 57 53 57 54 13 a5 16 ',
	'move 21 8H-7C→cascade':
		'    3H 8D 4D AC 2D AH 2S \n' +
		'    JC 9D 9C KD KC KS 5C \n' +
		'    JD 8S 4C QS    QH 2H \n' +
		'    6D 7D 3C       JS TD \n' +
		'    6H 6C 7S       TH 9S \n' +
		'    QC 5H QD          2C \n' +
		'    KH    TS          5S \n' +
		'    8H    JH          4H \n' +
		'    7C    TC          3S \n' +
		'          9H             \n' +
		'          8C             \n' +
		'          7H             \n' +
		'          6S             \n' +
		'          5D             \n' +
		'          4S             \n' +
		'          3D             \n' +
		' move 14 2S→3D (auto-foundation 14 AS,2S)\n' +
		':h shuffle32 2107\n' +
		' 64 62 6a 6b 3c 34 14 74 \n' +
		' 34 38 3d 34 18 15 73 71 \n' +
		' 73 57 53 57 54 13 a5 16 \n' +
		' 14 ',
	[FIFTY_TWO_CARD_FLOURISH]:
		' 7H       2C             \n' +
		' KS 6C AC 5H KD 6D KC KH \n' +
		' QD AH AD 4S QC 5S QH QS \n' +
		' JC 3D AS    JH 4H JS JD \n' +
		' TD    8S    TS 3C TH TC \n' +
		' 9C          9D 2H 9S 9H \n' +
		' 8D          8C    8H    \n' +
		' 7S          7D    7C    \n' +
		'             6S    6H    \n' +
		'             5D    5C    \n' +
		'             4C    4D    \n' +
		'             3H    3S    \n' +
		'             2S    2D    \n' +
		' move 3a 7H→cell\n' +
		':h shuffle32 23190\n' +
		' 6d 76 75 d5 7d 75 72 7a \n' +
		' 37 57 27 31 37 17 d3 5d \n' +
		' 57 5c 57 5b 52 a2 c5 b5 \n' +
		' 1c 12 15 17 16 15 d1 c1 \n' +
		' 85 85 45 4d 4c 41 46 45 \n' +
		' d4 c5 25 86 81 8a 48 64 \n' +
		' 6b 61 6c 62 6d a6 c6 86 \n' +
		' b8 48 24 21 3a ',
	'auto-foundation 56 KD,KS': '',
	'flourish 56 KD,KS': '',
	'invalid move 86 7D→9C': '',
	'invalid move 75 6D-5S-4D-3C→7C':
		' TD       TC AH 2S       \n' +
		' QD AC AD 5D 9H JH 4H 6S \n' +
		' 2H 4C QS KD 8C 5C>6D|QH \n' +
		' 3D 8H 3S 2D 3H 8D|5S|JS \n' +
		' JD 4S 2C KC 7C JC|4D|TS \n' +
		' 7S 9D 6H 7D    QC|3C|7H \n' +
		' 9S TH    6C    KS    9C \n' +
		' 8S KH    5H             \n' +
		' move 54 6C-5H→7D\n' +
		':h shuffle32 27571\n' +
		' 34 4d d4 4d d4 5d 75 74 \n' +
		' 47 4a 54 ',
};

export function pullActionTextExamples(actionTextExamples: string[], actionText: string) {
	const index = actionTextExamples.findIndex((example) => example === actionText);
	if (index > -1) actionTextExamples.splice(index, 1);
	else throw new Error(`should we add "${actionText}" to ACTION_TEXT_EXAMPLES?`);
}
