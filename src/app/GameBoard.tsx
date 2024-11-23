import { MutableRefObject, useRef } from 'react';
import { CardsOnBoard } from '@/app/components/CardsOnBoard';
import { DebugCursors } from '@/app/components/DebugCursors';
import { KeyboardCursor } from '@/app/components/KeyboardCursor';
import { PileMarkers } from '@/app/components/PileMarkers';
import { StatusBar } from '@/app/components/StatusBar';
import { TextBoard } from '@/app/components/TextBoard';
import { UndoButton } from '@/app/components/UndoButton';
import { WinMessage } from '@/app/components/WinMessage';
import { FixtureLayout } from '@/app/hooks/contexts/FixtureSizes/FixtureSizes';
import { FixtureSizesContextProvider } from '@/app/hooks/contexts/FixtureSizes/FixtureSizesContextProvider';
import { useSettings } from '@/app/hooks/contexts/Settings/useSettings';
import { useKeybaordArrowControls } from '@/app/hooks/controls/useKeybaordArrowControls';
import { useKeybaordMiscControls } from '@/app/hooks/controls/useKeybaordMiscControls';
import { useNewGameClick } from '@/app/hooks/controls/useNewGameClick';

interface GameBoardDisplayOptions {
	showUndoButton?: boolean;
	showStatusBar?: boolean;
	showTextBoard?: boolean;
	showDebugCursors?: boolean;
	fixtureLayout?: FixtureLayout;
}

const nextUid = (function*() {
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

// FIXME needs some kind of ID so we can have more than one on screen at a time
export default function GameBoard({
	className,
	displayOptions = {},
}: {
	className: string;
	displayOptions?: GameBoardDisplayOptions;
}) {
	useKeybaordMiscControls();
	useKeybaordArrowControls();
	const handleNewGameClick = useNewGameClick();
	const gameBoardRef = useRef<HTMLElement | null>(null);
	const gameBoardIdRef: MutableRefObject<string> = useRef('');
	if (!gameBoardIdRef.current) gameBoardIdRef.current = nextUid.next().value;

	return (
		<main ref={gameBoardRef} className={className} onClick={handleNewGameClick}>
			<FixtureSizesContextProvider
				gameBoardRef={gameBoardRef}
				fixtureLayout={displayOptions.fixtureLayout}
			>
				<BoardLayout displayOptions={displayOptions} gameBoardIdRef={gameBoardIdRef} />
			</FixtureSizesContextProvider>
		</main>
	);
}

function BoardLayout({
	displayOptions: { showUndoButton, showStatusBar, showTextBoard, showDebugCursors },
	gameBoardIdRef,
}: {
	displayOptions: GameBoardDisplayOptions;
	gameBoardIdRef: MutableRefObject<string>;
}) {
	const { showDebugInfo, showKeyboardCursor } = useSettings();

	// if we pass in a display option, respect that
	// if we do not pass in a display option, fall back to defaults / settings
	if (showUndoButton === undefined) showUndoButton = true;
	if (showStatusBar === undefined) showStatusBar = true;
	if (showTextBoard === undefined) showTextBoard = showDebugInfo;
	if (showDebugCursors === undefined) showDebugCursors = showDebugInfo;

	return (
		<>
			<PileMarkers />
			<WinMessage />
			{showKeyboardCursor && <KeyboardCursor />}
			<CardsOnBoard gameBoardIdRef={gameBoardIdRef} />
			{!!showUndoButton && <UndoButton />}
			{!!showStatusBar && <StatusBar />}

			{!!showTextBoard && <TextBoard />}
			{!!showDebugCursors && <DebugCursors />}
		</>
	);
}
