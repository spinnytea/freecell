'use client';

import styles_gameboard from '@/app/gameboard.module.css';
import { StatusBar } from '@/app/components/statusbar';
import { useFixtureSizes } from '@/app/hooks/useFixtureSizes';
import { CardImage, Rank } from './components/cards/card';

export default function Page() {
	const fixtureSizes = useFixtureSizes();

	return (
		<main className={styles_gameboard.main}>
			{/* FIXME temp */}
			{(['2', '3', '4', '5'] as Rank[]).map((rank, idx) => (
				<div
					key={`cell-${idx.toString()}`}
					style={{
						position: 'absolute',
						left: fixtureSizes.home.cellLeft[idx],
						top: fixtureSizes.home.top,
					}}
				>
					<CardImage rank={rank} suit="spades" width={fixtureSizes.cardWidth} />
				</div>
			))}
			{(['2', '3', '4', '5'] as Rank[]).map((rank, idx) => (
				<div
					key={`cell-${idx.toString()}`}
					style={{
						position: 'absolute',
						left: fixtureSizes.home.foundationLeft[idx],
						top: fixtureSizes.home.top,
					}}
				>
					<CardImage rank={rank} suit="hearts" width={fixtureSizes.cardWidth} />
				</div>
			))}
			{(['2', '3', '4', '5', '6', '7', '8', '9'] as Rank[]).map((rank, idx) => (
				<div
					key={`cell-${idx.toString()}`}
					style={{
						position: 'absolute',
						left: fixtureSizes.tableau.columnLeft[idx],
						top: fixtureSizes.tableau.top,
					}}
				>
					<CardImage rank={rank} suit="clubs" width={fixtureSizes.cardWidth} />
				</div>
			))}
			<StatusBar />
		</main>
	);
}
