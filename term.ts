import { Position } from '@/app/game/card/card';
import { FreeCell } from '@/app/game/game';
import readline from 'readline';

// TODO (terminal) (controls) play the game, update controls
// HACK (terminal) need to lazy load chalk? how to wait until ready before starting?
type ChalkColors = 'red' | 'yellow' | 'bold' | 'blueBright' | 'underline' | 'bgYellowBright';
type ColorizeCb = (str: string, ...colors: ChalkColors[]) => string;
let colorize: ColorizeCb = (str) => str;
// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
	const chalk = (await import('chalk')).default;
	colorize = (str, ...colors) => colors.reduce((ret, c) => ret[c], chalk)(str);
	printGame();
	console.log('Press any key (Ctrl+C to exit)');
})();

// TODO (terminal) review gameplay loop and design
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

let game = new FreeCell().shuffle32().dealAll();
printGame();
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

// TODO (terminal) (hut) play the game, what needs clarity?
// HACK (terminal) just replace stufff to get colors
function printGame() {
	console.clear();
	console.log(
		game
			.print()
			// TODO (terminal) last line (previous action text)
			//  - we can't just do this replace forever :/
			//  - "move 21 6S→7D (auto-foundation 5 AC)"
			// .replace(/\n.*$/, (match) => colorize(match, 'blueBright'))
			// underline home row
			// .replace(/^.*\n/, (match) => colorize(match, 'underline'))
			// extra lines
			// .replace(/:.*\n/g, (match) => colorize(match, 'bgYellowBright'))
			// red suits
			.replace(/([123456789TJZK])([DH])/g, (match) => colorize(match, 'red'))
			// TODO (terminal) suit icons: ♣️♧♣ | ♦️♢♦ | ♥️♡♥ | ♠️♤♠
			// .replace(/([123456789TJZK])([CDHS])/g, (match, ...groups) => {
			// 	if (groups[1] === 'C') return `${String(groups[0])}♣`;
			// 	if (groups[1] === 'D') return `${String(groups[0])}♦`;
			// 	if (groups[1] === 'H') return `${String(groups[0])}♥`;
			// 	if (groups[1] === 'S') return `${String(groups[0])}♠`;
			// 	return `${String(groups[0])}${String(groups[1])}`;
			// })
			// cursor/selection
			.replace(/[>|]/g, (match) => colorize(match, 'yellow', 'bold'))
	);
}

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
		printGame();
	}
};

process.stdin.on('keypress', listener);
process.stdin.resume();
