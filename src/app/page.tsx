'use client';

import { useEffect, useRef, useState } from 'react';
import CardsOnBoard from '@/app/components/CardsOnBoard';
import { DebugCursors } from '@/app/components/DebugCursors';
import { PileMarkers } from '@/app/components/PileMarkers';
import { StatusBar } from '@/app/components/StatusBar';
import { TextBoard } from '@/app/components/TextBoard';
import { FreeCell } from '@/app/game/game';
import styles_gameboard from '@/app/gameboard.module.css';
import {
	calcFixtureSizes,
	DEFAULT_CLIENT_HEIGHT,
	DEFAULT_CLIENT_WIDTH,
} from '@/app/hooks/FixtureSizes/FixtureSizes';
import { FixtureSizesContext } from '@/app/hooks/FixtureSizes/FixtureSizesContext';
import { GameContext } from '@/app/hooks/Game/GameContext';

export default function Page() {
	const gameBoardRef = useRef<HTMLElement | null>(null);
	const [game, setGame] = useState(() => new FreeCell().shuffle32(1));
	// REVIEW wait until we have an actual value init
	const [fixtureSizes, setFixtureSizes] = useState(() => calcFixtureSizes());

	function onClick() {
		// TODO just for initial testing
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

	useEffect(() => {
		function updateSize() {
			const screenWidth = gameBoardRef.current?.offsetWidth ?? DEFAULT_CLIENT_WIDTH;
			const screenHeight = gameBoardRef.current?.offsetHeight ?? DEFAULT_CLIENT_HEIGHT;
			setFixtureSizes((fs) => {
				if (fs.boardWidth !== screenWidth || fs.boardHeight !== screenHeight) {
					return calcFixtureSizes(screenWidth, screenHeight);
				}
				return fs;
			});
		}
		window.addEventListener('resize', updateSize);
		updateSize();
		return () => {
			window.removeEventListener('resize', updateSize);
		};
	}, [gameBoardRef]);

	// TODO render game.cursor (+ debug view)
	// TODO render game.selection (+ debug view)

	return (
		<main ref={gameBoardRef} className={styles_gameboard.main} onClick={onClick}>
			<FixtureSizesContext.Provider value={fixtureSizes}>
				<GameContext.Provider value={[game, setGame]}>
					<PileMarkers />
					<CardsOnBoard />
					<DebugCursors />
					<TextBoard />
					<StatusBar />
				</GameContext.Provider>
			</FixtureSizesContext.Provider>
		</main>
	);
}
