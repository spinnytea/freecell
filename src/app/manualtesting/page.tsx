'use client';

import Link from 'next/link';
import styles_common from '@/app/common.module.css';
import { CardImage } from '@/app/components/cards/CardImage';
import { RankList, SuitList } from '@/app/game/card/card';
import GameBoard from '@/app/GameBoard';
import styles_gameboard from '@/app/gameboard.module.css';
import StaticGameContextProvider from '@/app/hooks/contexts/Game/StaticGameContextProvider';
import styles_manualtesting from '@/app/manualtesting/manualtesting.module.css';

const gamePrint_52CardFlourish =
	'>7H       2C             \n' +
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
	' move 3a 7H→cell';

/*
	TODO (techdebt) much needed style overhaul

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
*/
export default function Page() {
	return (
		<main className={styles_common.main}>
			<Link href="/">
				<span>&lt;-</span> Back to game
			</Link>
			<div className="instruction">Visual check on all Suit x Rank.</div>
			<div className="instruction">Visual check on red/black jokers.</div>
			<div className={styles_manualtesting.allplayingcards}>
				{SuitList.map((suit) =>
					RankList.map((rank) => (
						<CardImage key={`${rank}-${suit}`} rank={rank} suit={suit} width={80} />
					))
				)}
				<CardImage rank="joker" suit="clubs" width={80} />
				<CardImage rank="joker" suit="diamonds" width={80} />
				<CardImage rank="joker" suit="hearts" width={80} />
				<CardImage rank="joker" suit="spades" width={80} />
				<CardImage rank="joker" suit="spades" width={80} hidden />
			</div>
			<div className={styles_manualtesting.allplayingcards}>
				{SuitList.map((suit) =>
					RankList.map((rank) => (
						<CardImage key={`${rank}-${suit}`} rank={rank} suit={suit} width={40} />
					))
				)}
				<CardImage rank="joker" suit="clubs" width={40} />
				<CardImage rank="joker" suit="diamonds" width={40} />
				<CardImage rank="joker" suit="hearts" width={40} />
				<CardImage rank="joker" suit="spades" width={40} />
				<CardImage rank="joker" suit="spades" width={40} hidden />
			</div>
			<div className="instruction">Background texture scrolls (it&apos;s not fixed in place).</div>
			<div className="instruction">
				Selection is obvious for each of cell, foundation, cascade, deck.
			</div>
			<div className="instruction">Foundation always renders highest card.</div>
			<div className="instruction">Visual check DebugCursors.</div>

			{/* FIXME keep refining */}
			{/*  - include next move, e.g. '3b' */}
			{/*  - swap out GameBoard - we want separate/simpler controls? */}
			{/*  - swap out GameBoard - we want to define our own FixtureSizesContext.Provider w/ smaller size */}
			<StaticGameContextProvider gamePrint={gamePrint_52CardFlourish}>
				<GameBoard
					className={styles_gameboard.inline}
					displayOptions={{ showStatusBar: false, showUndoButton: false, showTextBoard: false }}
				/>
			</StaticGameContextProvider>
		</main>
	);
}
