import Link from 'next/link';
import styles_common from '@/app/common.module.css';
import { CardImage } from '@/app/components/CardImage';
import { RankList, SuitList } from '@/app/game/card';
import styles_manualtesting from '@/app/manualtesting/manualtesting.module.css';

export default function Page() {
	return (
		<main className={styles_common.main}>
			<Link href="/">
				<span>&lt;-</span> Back to game
			</Link>
			<div className="instruction">Spot check all the cards.</div>
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
		</main>
	);
}
