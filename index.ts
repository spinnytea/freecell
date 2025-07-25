import { Position } from '@/app/game/card/card';
import { FreeCell } from '@/app/game/game';
import readline from 'readline';

// TODO (terminal) review gameplay loop and design
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

let game = new FreeCell().shuffle32();
console.clear();
console.log(game.print());
console.log('Press any key (Ctrl+C to exit)');

type KeypressListener = (
	str: string | undefined,
	key:
		| {
				sequence: string;
				name: string;
				ctrl: boolean;
				meta: boolean;
				shift: boolean;
		  }
		| undefined
) => void;

const Hotkeys = [
	'a',
	'A',
	'b',
	'B',
	'c',
	'C',
	'd',
	'D',
	'e',
	'E',
	'f',
	'F',
	'h',
	'H',
	'1',
	'2',
	'3',
	'4',
	'5',
	'6',
	'7',
	'8',
	'9',
	'0',
];

const listener: KeypressListener = (str = '<none>', key) => {
	if (!key) return;
	const before = game;
	if (key.ctrl && key.name === 'c') {
		console.log('Exiting...');
		process.exit();
	} else if (key.name === 'return' || key.name === 'space') {
		if (game.cursor.fixture === 'deck') {
			game = game.$shuffleOrDealAll();
		} else if (key.name === 'return') {
			game = game.touch();
		} else {
			game = game.$touchAndMove(game.cursor);
		}
	} else if (key.name === 'escape') {
		game = game.clearSelection();
	} else if (key.name === 'x') {
		game = game.$toggleCursor();
	} else if (key.name === 'z') {
		game = game.$undoThenShuffle();
	} else if (
		key.name === 'up' ||
		key.name === 'right' ||
		key.name === 'left' ||
		key.name === 'down'
	) {
		game = game.moveCursor(key.name);
	} else if (Hotkeys.includes(key.name)) {
		game = game.touchByPosition(key.name.toLowerCase() as Position);
	} else {
		void str;
		// console.log(`You pressed: '${str}' (Key name: ${key.name})`);
	}

	if (before !== game) {
		console.clear();
		console.log(game.print());
	}
};

process.stdin.on('keypress', listener);
process.stdin.resume();
