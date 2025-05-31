import { MutableRefObject, useContext, useRef } from 'react';
import classNames from 'classnames';
import { CardImage } from '@/app/components/cards/CardImage';
import { CardsOnBoard } from '@/app/components/CardsOnBoard';
import { DebugCursors } from '@/app/components/DebugCursors';
import { KeyboardCursor } from '@/app/components/KeyboardCursor';
import { PileMarkers } from '@/app/components/PileMarkers';
import { SettingsButton } from '@/app/components/SettingsButton';
import { StatusBar } from '@/app/components/StatusBar';
import { TextBoard } from '@/app/components/TextBoard';
import { UndoButton } from '@/app/components/UndoButton';
import { WinMessage } from '@/app/components/WinMessage';
import styles_gameboard from '@/app/gameboard.module.css';
import { FixtureLayout } from '@/app/hooks/contexts/FixtureSizes/FixtureSizes';
import { FixtureSizesContext } from '@/app/hooks/contexts/FixtureSizes/FixtureSizesContext';
import { FixtureSizesContextProvider } from '@/app/hooks/contexts/FixtureSizes/FixtureSizesContextProvider';
import { useSettings } from '@/app/hooks/contexts/Settings/useSettings';
import { useClickSetupControls } from '@/app/hooks/controls/useClickSetupControls';
import { useKeybaordArrowControls } from '@/app/hooks/controls/useKeybaordArrowControls';
import { useKeybaordMiscControls } from '@/app/hooks/controls/useKeybaordMiscControls';

export interface GameBoardDisplayOptions {
	showSettingsButton?: boolean;
	showUndoButton?: boolean;
	showStatusBar?: boolean;
	showTextBoard?: boolean;
	showDebugCursors?: boolean;
	fixtureLayout?: FixtureLayout;
}

const nextUid = (function* () {
	let id = 0;
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	while (true) {
		yield id.toString(16);
		id++;
		if (id > Number.MAX_SAFE_INTEGER / 2) {
			id = 0;
		}
	}
})();

// BUG (controls) keyboard controls are global for the entire window, not isolated to the specific game board
// BUG (controls) generally speaking, the keyboard controls are greedy
//  - cannot interact with status bar -> manual teating
//  - when you undo or leave settings, focus is still there; arrow keys should move focus back to the game board
// REVIEW (techdebt) (deployment) verify that the card back is always available
export default function GameBoard({
	className,
	displayOptions = {},
}: {
	className: string;
	displayOptions?: GameBoardDisplayOptions;
}) {
	const existsFixtureSizes = useContext(FixtureSizesContext).existsFixtureSizes;

	useKeybaordMiscControls();
	useKeybaordArrowControls();
	const handleClickSetup = useClickSetupControls();
	const gameBoardRef = useRef<HTMLElement | null>(null);
	const gameBoardIdRef: MutableRefObject<string> = useRef('');
	if (!gameBoardIdRef.current) gameBoardIdRef.current = nextUid.next().value;

	return (
		<main
			ref={gameBoardRef}
			tabIndex={0}
			className={classNames(className, styles_gameboard.common)}
			onClick={handleClickSetup}
		>
			<div className={styles_gameboard.hiddenDeckBack}>
				<CardImage rank="king" suit="hearts" hidden width={0} />
			</div>
			{existsFixtureSizes ? (
				<BoardLayout displayOptions={displayOptions} gameBoardIdRef={gameBoardIdRef} />
			) : (
				<FixtureSizesContextProvider
					gameBoardRef={gameBoardRef}
					fixtureLayout={displayOptions.fixtureLayout}
				>
					<BoardLayout displayOptions={displayOptions} gameBoardIdRef={gameBoardIdRef} />
				</FixtureSizesContextProvider>
			)}
		</main>
	);
}

function BoardLayout({
	displayOptions: {
		showSettingsButton,
		showUndoButton,
		showStatusBar,
		showTextBoard,
		showDebugCursors,
	},
	gameBoardIdRef,
}: {
	displayOptions: GameBoardDisplayOptions;
	gameBoardIdRef?: MutableRefObject<string>;
}) {
	const { showDebugInfo, showKeyboardCursor } = useSettings();

	// if we pass in a display option, respect that
	// if we do not pass in a display option, fall back to defaults / settings
	if (showSettingsButton === undefined) showSettingsButton = true;
	if (showUndoButton === undefined) showUndoButton = true;
	if (showStatusBar === undefined) showStatusBar = true;
	if (showTextBoard === undefined) showTextBoard = showDebugInfo;
	if (showDebugCursors === undefined) showDebugCursors = showDebugInfo;

	return (
		<>
			<PileMarkers gameBoardIdRef={gameBoardIdRef} />
			<WinMessage />
			{showKeyboardCursor && <KeyboardCursor />}
			<CardsOnBoard gameBoardIdRef={gameBoardIdRef} />
			{!!showSettingsButton && <SettingsButton />}
			{!!showUndoButton && <UndoButton />}
			{!!showStatusBar && <StatusBar />}

			{!!showTextBoard && <TextBoard />}
			{!!showDebugCursors && <DebugCursors />}
		</>
	);
}
