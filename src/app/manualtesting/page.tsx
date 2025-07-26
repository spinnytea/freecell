'use client';

import { useEffect, useState } from 'react';
import { useGSAP } from '@gsap/react';
import classNames from 'classnames';
import { Draggable, gsap } from 'gsap/all';
import Link from 'next/link';
import styles_common from '@/app/common.module.css';
import { CardImage } from '@/app/components/cards/CardImage';
import { ControlSchemes } from '@/app/components/cards/constants';
import GameBoard, { GameBoardDisplayOptions } from '@/app/GameBoard';
import styles_gameboard from '@/app/gameboard.module.css';
import StaticGameContextProvider from '@/app/hooks/contexts/Game/StaticGameContextProvider';
import { ManualTestingSettingsContextProvider } from '@/app/hooks/contexts/Settings/ManualTestingSettingsContextProvider';
import styles_manualtesting from '@/app/manualtesting/manualtesting.module.css';
import { RankList, SuitList } from '@/game/card/card';

gsap.registerPlugin(useGSAP);
gsap.registerPlugin(Draggable);

// XXX (techdebt) replace 52CardFlourish with 1/2
//  - it's not working because we can't make changes to a "win", how do we step between states?
//  - we trigger a rerender during unit testing, but we can't do that in manual testing
// const gamePrint_52CardFlourish1 = '>                        \n                         \n hand-jammed';
// const gamePrint_52CardFlourish2 = '>            KH KC KD KS \n                         \n hand-jammed';
// XXX (techdebt) somehow this one is getting shuffled when it's reset??
// const gamePrint_52CardFlourish =
// '' + //
// 	   '>                        \n'+
//       '                         \n'+
//       ':d KS KH KD KC QS QH QD QC JS JH JD JC TS TH TD TC 9S 9H 9D 9C 8S 8H 8D 8C 7S 7H 7D 7C 6S 6H 6D 6C 5S 5H 5D 5C 4S 4H 4D 4C 3S 3H 3D 3C 2S 2H 2D 2C AS AH AD AC \n' +
//       ' init';
const gamePrint_52CardFlourish =
	'>7H       2C             \n' +
	' KS 6C AC 5H KD 6D KC KH \n' +
	' QD AH AD 4S QC 5S QH QS \n' +
	' JC 3D AS    JH 4H JS JD \n' +
	' TD    8S    TS 4C TH TC \n' +
	' 9C          9D 3H 9S 9H \n' +
	' 8D          8C 3C 8H 4D \n' +
	' 7S          7D 2H 7C 3S \n' +
	'             6S 2S 6H 2D \n' +
	'             5D    5C    \n' +
	' move 3a 7H→cell';

const gamePrint_animations: { nextActionText: string; gamePrint: string }[] = [
	{
		nextActionText: 'Does not autoFoundation until a card is moved.',
		gamePrint:
			'' + //
			'>   JH JC JD JS \n' +
			' KH KC KD KS QH QC QD QS \n' +
			' hand-jammed',
	},
	{
		// TODO (techdebt) showUndoButton inside board, or just cycle move + undo
		nextActionText: 'move 36 5S-4H→cascade (auto-foundation 3262 3S,4D,4H,5C)',
		gamePrint:
			' 5D          2S 3D 3H 4C \n' +
			' KS 8C 9H 7C KH>   KD 9C \n' +
			' QH TD 6H QD QC    QS 8D \n' +
			' JC TH 7D JS JD    JH    \n' +
			'    KC 3S    TS    TC    \n' +
			'    4S|5S|         9D    \n' +
			'    6C|4H|         8S    \n' +
			'    9S             7H    \n' +
			'    8H             6S    \n' +
			'    7S             5H    \n' +
			'    6D                   \n' +
			'    5C                   \n' +
			'    4D                   \n' +
			' cursor right',
	},
	{
		nextActionText: 'move 18 5S-4H-3S→6D (auto-foundation 18 2D,3S)',
		gamePrint:
			' 9D          2C 2H 2S AD \n' +
			' 5H    QC KD TC KC 4S>6D \n' +
			' 2D    7S    JH QD 3H    \n' +
			' 5S    8C    6S JC 3C    \n' +
			' 4H    3D    9C TH KS    \n' +
			' 3S    KH    8H 9S 7D    \n' +
			'       TD       8D QS    \n' +
			'       QH       7C JD    \n' +
			'       JS       6H TS    \n' +
			'                5C 9H    \n' +
			'                4D 8S    \n' +
			'                   7H    \n' +
			'                   6C    \n' +
			'                   5D    \n' +
			'                   4C    \n' +
			' move 36 TH-9S-8D-7C-6H-5C-4D→JC',
	},
	// {
	// 	// TODO (techdebt) there isn't a way to get to the deal, static game provider resets to the win
	// 	//  - we need to set it during `useState` and allow `newGame` to start a new game
	// 	nextActionText: 'init',
	// 	gamePrint:
	// 		'>            KH KS KD KC \n' +
	// 		'                         \n' +
	// 		':    Y O U   W I N !    :\n' +
	// 		'                         \n' +
	// 		` hand-jammed`,
	// },
];

const supportedBrowsers = ['Mac Chrome', 'Mac Safari', 'Android Chrome', 'iPad Safari'];

const calcCardWidth = (windowInnerWidth = 9999) =>
	Math.floor(Math.min(Math.max((windowInnerWidth - 80) / 13, 10), 75));

const DEFAULT_DISPLAY_OPTIONS: GameBoardDisplayOptions = {
	showSettingsButton: false,
	showUndoButton: false,
	showStatusBar: false,
	showTextBoard: false,
	fixtureLayout: 'portrait',
};

/*
	TODO (techdebt) much needed style overhaul
	TODO (techdebt) manual testing Game #5, click to advance through all moves

	TODO (techdebt) manual tests for cursor
	TODO (techdebt) manual tests for selection: one, two, three, etc

	+-----------+
	| _ a c _ _ |
	|   a d     |
	|   a       |
	|   b       |
	|   b       |
	|   b       |
	+-----------+

	TODO (animation) animate cards sliding
	TODO (animation) animate cell selection rotation
	TODO (animation) animate invalid move animation
	TODO (animation) animate moving a sequence
	TODO (animation) animate cursorBox movement
	TODO (animation) animate flourish

	TODO (hud) fixture sizes: narrow
	TODO (hud) fixture sizes: wide
	TODO (hud) fixture sizes: mobile portrait
	TODO (hud) fixture sizes: mobile landscape

	TODO (deployment) various sizes of tall -> portrait -> landscape -> wide
	 - if not well defined playing fields to spot check, at least a reminder to play with the screen size

	TODO (controls) each of the control schemes

	TODO (techdebt) Selection is obvious for each of cell, foundation, cascade, deck.
	TODO (techdebt) Visual check DebugCursors.
*/
export default function Page() {
	const [cardWidth, setCardWidth] = useState(() => calcCardWidth());

	useEffect(() => {
		function updateCardWidth() {
			const innerWidth = typeof window === 'undefined' ? undefined : window.innerWidth;
			setCardWidth(calcCardWidth(innerWidth));
		}

		updateCardWidth();
		window.addEventListener('resize', updateCardWidth);
		return () => {
			window.removeEventListener('resize', updateCardWidth);
		};
	}, []);

	return (
		<main
			className={classNames(
				styles_common.page,
				styles_common.main,
				styles_manualtesting.instructions
			)}
		>
			<Link href="/">← Back to game</Link>
			<ol>
				<li>
					Playing Cards
					<ol>
						<li>Visual check on all Suit x Rank.</li>
						<li>Visual check on red/black jokers.</li>
					</ol>
					<ManualTestingSettingsContextProvider cardFace="SVGCards13">
						<div className={styles_manualtesting.allplayingcards}>
							{SuitList.map((suit) =>
								RankList.map((rank) => (
									<CardImage key={`${rank}-${suit}`} rank={rank} suit={suit} width={cardWidth} />
								))
							)}
							<CardImage rank="joker" suit="clubs" width={cardWidth} />
							<CardImage rank="joker" suit="diamonds" width={cardWidth} />
							<CardImage rank="joker" suit="hearts" width={cardWidth} />
							<CardImage rank="joker" suit="spades" width={cardWidth} />
							<CardImage rank="joker" suit="spades" width={cardWidth} hidden />
						</div>
					</ManualTestingSettingsContextProvider>
					<ManualTestingSettingsContextProvider cardFace="SmolCards">
						<div className={styles_manualtesting.allplayingcards}>
							{SuitList.map((suit) =>
								RankList.map((rank) => (
									<CardImage key={`${rank}-${suit}`} rank={rank} suit={suit} width={cardWidth} />
								))
							)}
							<CardImage rank="joker" suit="clubs" width={cardWidth} />
							<CardImage rank="joker" suit="diamonds" width={cardWidth} />
							<CardImage rank="joker" suit="hearts" width={cardWidth} />
							<CardImage rank="joker" suit="spades" width={cardWidth} />
							<CardImage rank="joker" suit="spades" width={cardWidth} hidden />
						</div>
					</ManualTestingSettingsContextProvider>
					<ol start={3} style={{ display: 'none' }}>
						{/* TODO (motivation) animate card flash for use in flourishes and end of game */}
						<li>
							Shiny ✨
							<ManualTestingSettingsContextProvider cardFace="SVGCards13">
								<div>
									<CardImage rank="king" suit="clubs" width={cardWidth} />
								</div>
							</ManualTestingSettingsContextProvider>
						</li>
					</ol>
				</li>

				<li>Background texture scrolls (it&apos;s not fixed in place).</li>

				<li>
					Flourish
					{/* TODO (techdebt) keep refining */}
					{/*  - include next move, e.g. '3b' */}
					{/*  - swap out GameBoard - we want separate/simpler controls? */}
					{/*  - swap out GameBoard - we don't want keyboard controls to bleed between games */}
					<ol>
						<li>Foundation always renders highest card.</li>
						<li>Win animation.</li>
						<li>Move 8S for a 52 Card Flourish (e.g. 3b).</li>
						{/* TODO (animation) reset deck animation */}
						{/* <li>Reset deck animation.</li> */}
					</ol>
					<ManualTestingSettingsContextProvider>
						<StaticGameContextProvider games={[gamePrint_52CardFlourish]}>
							<GameBoard
								className={styles_gameboard.inline}
								displayOptions={DEFAULT_DISPLAY_OPTIONS}
							/>
						</StaticGameContextProvider>
					</ManualTestingSettingsContextProvider>
				</li>

				<li>
					Ensure animation looks right
					<ol>
						{gamePrint_animations.map(({ nextActionText, gamePrint }) => (
							<li key={nextActionText}>
								{nextActionText}
								<ManualTestingSettingsContextProvider>
									<StaticGameContextProvider games={[gamePrint]}>
										<GameBoard
											className={styles_gameboard.inline}
											displayOptions={DEFAULT_DISPLAY_OPTIONS}
										/>
									</StaticGameContextProvider>
								</ManualTestingSettingsContextProvider>
							</li>
						))}
					</ol>
				</li>
				<li>
					Invalid moves.
					<ol>
						<li>Select just about anything, and then click on the foundation.</li>
						<li>Select a large stack, and try to move it to an empty cell, cascade.</li>
					</ol>
				</li>
				<li>
					Visually check settings/undo buttons in corners of gameplay.
					<ol>
						{supportedBrowsers.map((sb) => (
							<li key={sb}>{sb}</li>
						))}
					</ol>
				</li>
				<li>
					Visually check settings dialog & icons.
					<ol>
						{supportedBrowsers.map((sb) => (
							<li key={sb}>{sb}</li>
						))}
					</ol>
				</li>
				<li>
					Verify deck is not rerequested after winning a game. To do so:
					<ol>
						<li>Load a game from the web.</li>
						<li>Turn off wifi / enable airplane mode.</li>
						<li>Finish game.</li>
						<li>Restart and see the deck.</li>
						<li>Start a new game and verify cards.</li>
					</ol>
				</li>
				<li>
					Control Schemes: test each of the ControlSchemes
					<ol>
						{Object.values(ControlSchemes).map((v) => (
							<li key={v}>{v}</li>
						))}
					</ol>
				</li>
			</ol>
			<Link href="/">← Back to game</Link>
		</main>
	);
}
