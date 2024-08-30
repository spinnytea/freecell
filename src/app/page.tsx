'use client';

import { useEffect, useRef, useState } from 'react';
import CardsOnBoard from '@/app/components/CardsOnBoard';
import { DebugCursors } from '@/app/components/DebugCursors';
import { PileMarkers } from '@/app/components/PileMarkers';
import { StatusBar } from '@/app/components/StatusBar';
import { TextBoard } from '@/app/components/TextBoard';
import { FreeCell } from '@/app/game/game';
import styles_gameboard from '@/app/gameboard.module.css';
import { GameContext } from '@/app/hooks/GameContext';
import { useFixtureSizes } from '@/app/hooks/useFixtureSizes';

export default function Page() {
	const [game, setGame] = useState(() => new FreeCell().shuffle32(1)); // TODO just use redux
	const gameBoardRef = useRef<HTMLElement | null>(null);
	const fixtureSizes = useFixtureSizes(gameBoardRef); // TODO just make the game board a component (not hook), use redux

	/** @deprecated TODO just for initial testing */
	function onClick() {
		setGame((g) => g.dealAll());
	}

	useEffect(() => {
		function handleKey(event: KeyboardEvent) {
			const { key } = event;
			let consumed = false;
			switch (key) {
				case 'ArrowLeft':
					consumed = true;
					setGame((g) => g.moveCursor('left'));
					break;
				case 'ArrowRight':
					consumed = true;
					setGame((g) => g.moveCursor('right'));
					break;
				case 'ArrowUp':
					consumed = true;
					setGame((g) => g.moveCursor('up'));
					break;
				case 'ArrowDown':
					consumed = true;
					setGame((g) => g.moveCursor('down'));
					break;
				default:
					// console.log(`unused key: "${key}"`);
					break;
			}
			if (consumed) {
				event.stopPropagation();
			}
		}

		window.addEventListener('keydown', handleKey);
		return () => {
			window.removeEventListener('keydown', handleKey);
		};
	}, []);

	// TODO render game.cursor (+ debug view)
	// TODO render game.selection (+ debug view)

	return (
		<main ref={gameBoardRef} className={styles_gameboard.main} onClick={onClick}>
			<GameContext.Provider value={[game, setGame]}>
				<PileMarkers fixtureSizes={fixtureSizes} />
				<CardsOnBoard fixtureSizes={fixtureSizes} />
				<DebugCursors fixtureSizes={fixtureSizes} />
				<TextBoard />
				<StatusBar />
			</GameContext.Provider>
		</main>
	);
}
