import { Position } from '@/game/card/card';
import { FreeCell } from '@/game/game';
import readline from 'readline';

// TODO (terminal) (gameplay) save/load game
// TODO (terminal) (controls) play the game, update keyboard arrow controls
// HACK (terminal) need to lazy load chalk?
type ChalkColors = 'red' | 'yellow' | 'bold' | 'blueBright' | 'underline' | 'bgYellowBright';
type ColorizeCb = (str: string, ...colors: ChalkColors[]) => string;
let colorize: ColorizeCb = (str) => str;
(async () => {
	const chalk = (await import('chalk')).default;
	colorize = (str, ...colors) => colors.reduce((ret, c) => ret[c], chalk)(str);
	printGame();
	console.log('Press any key (Ctrl+C to exit)');
})().catch((error: unknown) => {
	console.error('Failed to initialize chalk (colorize)', error);
});

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

let game = new FreeCell().shuffle32().dealAll().$checkCanFlourish();
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

function printGame() {
	console.clear();

	const home = game.__printHome();
	const tableau = game.__printTableau();
	const win = game.__printWin();
	// XXX (print) all these caveats... in print and here
	const deck = ((s) => (s ? '\n:d ' + s : ''))(game.__printDeck());
	// XXX (print) all these caveats... in print and here
	const history = '\n ' + game.previousAction.text; // game.__printHistory();

	// XXX (print) how much do we care if game.print() and terminal do not match
	//  - i mean, the point of game.print is _for_ the terminal
	//  - it's just that to colorize with chalk… we need it in components?
	// if (game.print() !== [home, tableau, win, deck, history].join('')) {
	// 	console.error('print mismatch');
	// }

	// cursor/selection
	const cs = (s: string) => s.replace(/[>|*]/g, (match) => colorize(match, 'yellow', 'bold'));
	// red suits
	const rs = (s: string) =>
		s.replace(/([123456789TJQKA])([DH])/g, (match) => colorize(match, 'red'));

	console.log(
		rs(cs(home + tableau)) +
			// REVIEW (terminal) underline home row
			// .replace(/^.*\n/, (match) => colorize(match, 'underline')) +
			colorize(win, 'blueBright') +
			colorize(cs(deck), 'blueBright') +
			colorize(history, 'yellow')
		// REVIEW (terminal) suit icons: ♣️♧♣ | ♦️♢♦ | ♥️♡♥ | ♠️♤♠
		// .replace(/([123456789TJZK])([CDHS])/g, (match, rank, suit) => {
		// 	if (suit === 'C') return `${String(rank)}♣`;
		// 	if (suit === 'D') return `${String(rank)}♦`;
		// 	if (suit === 'H') return `${String(rank)}♥`;
		// 	if (suit === 'S') return `${String(rank)}♠`;
		// 	return `${String(rank)}${String(suit)}`;
		// })
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
			game = game.$shuffleOrDealAll().$checkCanFlourish();
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
