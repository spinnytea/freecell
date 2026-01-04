import { SyntheticEvent } from 'react';

export interface TLZR {
	top: number;
	left: number;
	zIndex: number;
	rotation: number;
}

export const domUtils = {
	/** @deprecated this is used by some unit tests when there is no DOM */
	domTLZR: new Map<string, TLZR>(),

	getDomAttributes(cardId: string): TLZR | undefined {
		const cardEl = document.getElementById(cardId);
		if (cardEl) {
			const dataTop = cardEl.getAttribute('data-top');
			const dataLeft = cardEl.getAttribute('data-left');
			const dataZIndex = cardEl.getAttribute('data-zIndex');
			const dataRotation = cardEl.getAttribute('data-rotation');
			if (dataTop && dataLeft) {
				const top = parseFloat(dataTop);
				const left = parseFloat(dataLeft);
				const zIndex = parseInt(dataZIndex ?? '0', 10);
				const rotation = parseInt(dataRotation ?? '0', 10);
				return { top, left, zIndex, rotation };
			}
		}
		return undefined;
	},

	/** useful for testing */
	setDomAttributes(cardId: string, { top, left, zIndex, rotation }: TLZR) {
		const cardEl = document.getElementById(cardId);
		if (cardEl) {
			cardEl.setAttribute('data-top', top.toString(10));
			cardEl.setAttribute('data-left', left.toString(10));
			cardEl.setAttribute('data-zIndex', zIndex.toString(10));
			cardEl.setAttribute('data-rotation', rotation.toString(10));
		}
	},

	addClass(elId: string, className: string) {
		const el = document.getElementById(elId);
		if (el) {
			el.classList.add(className);
		}
	},

	removeClass(elId: string, className: string) {
		const el = document.getElementById(elId);
		if (el) {
			el.classList.remove(className);
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
