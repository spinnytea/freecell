'use client';

import { useEffect, useRef, useState } from 'react';
import CardsOnBoard from '@/app/components/CardsOnBoard';
import { DebugCursors } from '@/app/components/DebugCursors';
import { PileMarkers } from '@/app/components/PileMarkers';
import { StatusBar } from '@/app/components/StatusBar';
import { TextBoard } from '@/app/components/TextBoard';
import { FreeCell } from '@/app/game/game';
import styles_gameboard from '@/app/gameboard.module.css';
import { FixtureSizesContextProvider } from '@/app/hooks/FixtureSizes/FixtureSizesContextProvider';
import { GameContext } from '@/app/hooks/Game/GameContext';

// let idx = 0;
// /** @deprecated just for testing */
// function trySeed(): number {
// 	const list = getSeedsByTag('zero cell');
// 	const seed = list[idx];
// 	console.log('trySeed', idx, '->', seed);
// 	return seed ?? 1;
// }

export default function Page() {
	const gameBoardRef = useRef<HTMLElement | null>(null);
	const [game, setGame] = useState(() => new FreeCell().shuffle32(12411).dealAll({ demo: true }));

	/** @deprecated just for testing */
	function onClick() {
		if (game.deck.length) {
			setGame(game.dealAll());
		}
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
			<FixtureSizesContextProvider gameBoardRef={gameBoardRef}>
				<GameContext.Provider value={[game, setGame]}>
					<PileMarkers />
					<CardsOnBoard />
					<DebugCursors />
					<TextBoard />
					<StatusBar />
				</GameContext.Provider>
			</FixtureSizesContextProvider>
		</main>
	);
}
