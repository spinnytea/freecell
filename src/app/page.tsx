'use client';

import { useEffect, useRef, useState } from 'react';
import { CardsOnBoard } from '@/app/components/CardsOnBoard';
import { DebugCursors } from '@/app/components/DebugCursors';
import { KeyboardCursor } from '@/app/components/KeyboardCursor';
import { PileMarkers } from '@/app/components/PileMarkers';
import { StatusBar } from '@/app/components/StatusBar';
import { TextBoard } from '@/app/components/TextBoard';
import { WinMessage } from '@/app/components/WinMessage';
import { FreeCell } from '@/app/game/game';
import styles_gameboard from '@/app/gameboard.module.css';
import { FixtureSizesContextProvider } from '@/app/hooks/FixtureSizes/FixtureSizesContextProvider';
import { GameContext } from '@/app/hooks/Game/GameContext';
import { SettingsContextProvider } from '@/app/hooks/Settings/SettingsContextProvider';
import { useSettings } from '@/app/hooks/Settings/useSettings';

// let idx = 0;
// /** @deprecated just for testing */
// function trySeed(): number {
// 	const list = getSeedsByTag('zero cell');
// 	const seed = list[idx];
// 	console.log('trySeed', idx, '->', seed);
// 	return seed ?? 1;
// }

// const almostWin = FreeCell.parse(
// 	'' + //
// 		'>            QC KD KH KS \n' + //
// 		'                KC       \n' + //
// 		' hand-jammed'
// );

export default function Page() {
	const gameBoardRef = useRef<HTMLElement | null>(null);
	const [game, setGame] = useState(() => new FreeCell().shuffle32());

	/** @deprecated just for getting started */
	function onClick() {
		if (game.win) {
			// click to reset
			setGame(new FreeCell().shuffle32());
		} else if (game.deck.length) {
			// click to deal
			setGame(game.dealAll());
		}
	}

	/** @deprecated just for getting started */
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
				case ' ':
				case 'Enter':
					consumed = true;
					setGame((g) => {
						if (g.cursor.fixture === 'deck') {
							return g.dealAll();
						}
						if (g.cursor.fixture === 'foundation' && g.win) {
							return new FreeCell().shuffle32();
						}
						return g.touch().autoFoundationAll();
					});
					break;
				case 'Escape':
					consumed = true;
					setGame((g) => g.clearSelection());
					break;
				default:
					console.log(`unused key: "${key}"`);
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

	return (
		<main ref={gameBoardRef} className={styles_gameboard.main} onClick={onClick}>
			<FixtureSizesContextProvider gameBoardRef={gameBoardRef}>
				<GameContext.Provider value={[game, setGame]}>
					<SettingsContextProvider>
						<BoardLayout />
					</SettingsContextProvider>
				</GameContext.Provider>
			</FixtureSizesContextProvider>
		</main>
	);
}

function BoardLayout() {
	const settings = useSettings();

	return (
		<>
			<PileMarkers />
			<WinMessage />
			<KeyboardCursor />
			<CardsOnBoard />
			<StatusBar />

			{settings.showDebugInfo && (
				<>
					<TextBoard />
					<DebugCursors />
				</>
			)}
		</>
	);
}
