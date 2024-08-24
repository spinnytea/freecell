'use client';

import { useRef, useState } from 'react';
import CardsOnBoard from '@/app/components/CardsOnBoard';
import { StatusBar } from '@/app/components/StatusBar';
import { TextBoard } from '@/app/components/TextBoard';
import { FreeCell } from '@/app/game/game';
import styles_gameboard from '@/app/gameboard.module.css';
import { GameContext } from '@/app/hooks/GameContext';
import { useFixtureSizes } from '@/app/hooks/useFixtureSizes';

export default function Page() {
	const gameState = useState(() => new FreeCell().shuffle32(1));
	const gameBoardRef = useRef<HTMLElement | null>(null);
	const fixtureSizes = useFixtureSizes(gameBoardRef);

	/** @deprecated TODO just for initial testing */
	function onClick() {
		gameState[1](gameState[0].dealAll());
	}

	return (
		<main ref={gameBoardRef} className={styles_gameboard.main} onClick={onClick}>
			<GameContext.Provider value={gameState}>
				{/* TODO empty fixtures */}
				<CardsOnBoard fixtureSizes={fixtureSizes} />
				<TextBoard />
				<StatusBar />
			</GameContext.Provider>
		</main>
	);
}
