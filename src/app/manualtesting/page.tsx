import Link from 'next/link';
import styles_common from '@/app/common.module.css';
import { CardImage } from '@/app/components/CardImage';
import { RankList, SuitList } from '@/app/game/card';
import styles_manualtesting from '@/app/manualtesting/manualtesting.module.css';

/*
	TODO (techdebt) much needed style overhaul

	TODO (techdebt) manual tests for cursor/selection
	+-----------+
	| _ a c _ _ |
	|   a d     |
	|   a       |
	|   b       |
	|   b       |
	|   b       |
	+-----------+

	TODO (animation) invalid move animation

	TODO (animation) animate moving a sequence

	TODO (deployment) various sizes of tall -> portrait -> landscape -> wide
	 - if not well defined playing fields to spot check, at least a reminder to play with the screen size
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
			<div className="instruction">Background texture scrolls (it&apos;s not fixed in place).</div>
			<div className="instruction">
				Selection is obvious for each of cell, foundation, cascade, deck.
			</div>
			<div className="instruction">Foundation always renders highest card.</div>
			<div className="instruction">Visual check DebugCursors.</div>
		</main>
	);
}
