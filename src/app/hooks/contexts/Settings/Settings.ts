import { CardFaces, ControlSchemes } from '@/app/components/cards/constants';

export interface Settings {
	newGameCascadeCount: number;
	newGameCellCount: number;
	showSettingsDialog: boolean;
	showDebugInfo: boolean;
	// XXX (techdebt) maybe showKeyboardCursor doesn't belong in settings, but we don't have another shared state setup yet
	showKeyboardCursor: boolean;
	cardFace: CardFaces | 'auto';
	enabledControlSchemes: Set<ControlSchemes>;
}

// TODO (settings) two different deck positions, with 2 different keyboard layouts
export function calcDefaultSettings(): Settings {
	return {
		newGameCascadeCount: 8,
		newGameCellCount: 4,
		showSettingsDialog: false,
		showDebugInfo: false,
		showKeyboardCursor: false,
		cardFace: 'auto',
		// as much as i want mobile and desktop to have different initial settings
		// the audiance (excluding myself) really wants the default to be drag-and-drop
		// TODO (settings) persist playstyle choices to localStorage
		enabledControlSchemes: new Set([
			ControlSchemes.Keyboard,
			ControlSchemes.Hotkeys,

			// ControlSchemes.ClickToSelect,
			ControlSchemes.ClickToMove,
			// XXX (techdebt) (click-to-move) (drag-and-drop) (dragndrop-bugs) click-to-move is now fully dependent on drag-and-drop being enabled
			ControlSchemes.DragAndDrop,
		]),
	};
}
