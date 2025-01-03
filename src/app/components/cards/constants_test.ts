export const ACTION_TEXT_EXAMPLES = [
	'init',
	'init with invalid history',
	'shuffle deck (0)',
	'deal all cards',
	'deal most cards',
	'cursor set',
	'select 6D',
	'select 4D-3S-2D',
	'select 8 7D',
	'select 8 4D-3S-2D',
	'deselect KS',
	'deselect 4D-3S-2D',
	'deselect 6 2C',
	'deselect 6 4D-3S-2D',
	'touch stop',
	'move 3a KC→cell',
	'move 8h AD→foundation',
	'move 57 KS→cascade',
	'move 23 KC-QD-JS→cascade',
	'move 15 TD→JS',
	'move 78 JH-TC-9H-8S-7H→QS',
	'move 53 6H→7C (auto-foundation 3 AD)',
	'move 53 6H→7C (flourish 4 AD)',
	'auto-foundation 56 KD,KS',
	'flourish 56 KD,KS',
	'invalid move 86 7D→9C',
];

export function pullActionTextExamples(actionTextExamples: string[], actionText: string) {
	const index = actionTextExamples.findIndex((example) => example === actionText);
	if (index === -1) throw new Error(`should we add "${actionText}" to ACTION_TEXT_EXAMPLES?`);
	actionTextExamples.splice(index, 1);
}
