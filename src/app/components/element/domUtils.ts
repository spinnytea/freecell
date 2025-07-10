import { SyntheticEvent } from 'react';

export interface TLZ {
	top: number;
	left: number;
	zIndex: number;
}

export const domUtils = {
	/** @deprecated this is used by some unit tests when there is no DOM */
	domTLZ: new Map<string, TLZ>(),

	getDomAttributes(cardId: string): TLZ | undefined {
		const cardEl = document.getElementById(cardId);
		if (cardEl) {
			const dataTop = cardEl.getAttribute('data-top');
			const dataLeft = cardEl.getAttribute('data-left');
			const dataZIndex = cardEl.getAttribute('data-zIndex');
			if (dataTop && dataLeft) {
				const top = parseFloat(dataTop);
				const left = parseFloat(dataLeft);
				const zIndex = parseInt(dataZIndex ?? '0', 10);
				return { top, left, zIndex };
			}
		}
		return undefined;
	},

	setDomAttributes(cardId: string, { top, left, zIndex }: TLZ) {
		const cardEl = document.getElementById(cardId);
		if (cardEl) {
			cardEl.setAttribute('data-top', top.toString(10));
			cardEl.setAttribute('data-left', left.toString(10));
			cardEl.setAttribute('data-zIndex', zIndex.toString(10));
		}
	},

	getBoundingClientRect(cardId: string): { top: number; left: number } | undefined {
		const cardEl = document.getElementById(cardId);
		if (cardEl) {
			const bounds = cardEl.getBoundingClientRect();
			return {
				top: bounds.top,
				left: bounds.left,
			};
		}
		return undefined;
	},

	consumeDomEvent(event: Event | SyntheticEvent) {
		event.preventDefault();
		event.stopPropagation();
		if ('stopImmediatePropagation' in event) {
			event.stopImmediatePropagation();
		}
	},
};
