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
		enabledControlSchemes: new Set([
			'keyboard',
			// 'keyboard hotkeys', // TODO (controls) impl
			// 'mouse hotcolumns', // TODO (controls) impl
			// 'click-to-select', // FIXME enable
			// 'click-to-move', // FIXME enable
			'drag-and-drop',
		]),
	};
}
