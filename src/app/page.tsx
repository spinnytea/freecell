'use client';

import { useRef } from 'react';
import { CardImage } from '@/app/components/CardImage';
import { StatusBar } from '@/app/components/StatusBar';
import { Rank } from '@/app/game/card';
import styles_gameboard from '@/app/gameboard.module.css';
import { useFixtureSizes } from '@/app/hooks/useFixtureSizes';

export default function Page() {
	const gameBoardRef = useRef<HTMLElement | null>(null);
	const fixtureSizes = useFixtureSizes(gameBoardRef);

	return (
		<main ref={gameBoardRef} className={styles_gameboard.main}>
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
						left: fixtureSizes.tableau.cascadeLeft[idx],
						top: fixtureSizes.tableau.top,
					}}
				>
					<CardImage rank={rank} suit="clubs" width={fixtureSizes.cardWidth} />
				</div>
			))}
			<div
				style={{
					position: 'absolute',
					left: fixtureSizes.deck.left,
					top: fixtureSizes.deck.top,
				}}
			>
				<CardImage rank="king" suit="diamonds" hidden width={fixtureSizes.cardWidth} />
			</div>

			<StatusBar />
		</main>
	);
}
