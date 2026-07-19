import { type MouseEvent, useEffect, useRef, useState } from 'react';
import styles_buttons from '@/app/components/buttons.module.css';
import { domUtils } from '@/app/components/element/domUtils';

const TEXT_DEFAULT = 'Copy Game';
const TEXT_SUCCESS = 'Copied!';
const TEXT_FAILURE = 'Failed';

function checkClipboardAvailable(): boolean {
	return (
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		navigator?.clipboard?.writeText !== undefined &&
		typeof navigator.clipboard.writeText === 'function'
	);
}

export function CopyClipboardButton({ text }: { text: () => string }) {
	const [buttonText, setButtonText] = useState(TEXT_DEFAULT);
	const [canCopy, setCanCopy] = useState(checkClipboardAvailable);
	const resetTimeoutRef = useRef<number | null>(null);

	useEffect(() => {
		setCanCopy(checkClipboardAvailable());
	}, []);

	useEffect(() => {
		return () => {
			if (resetTimeoutRef.current) {
				clearTimeout(resetTimeoutRef.current);
			}
		};
	}, []);

	function resetText() {
		if (resetTimeoutRef.current) {
			clearTimeout(resetTimeoutRef.current);
		}

		resetTimeoutRef.current = window.setTimeout(() => {
			setButtonText(TEXT_DEFAULT);
			resetTimeoutRef.current = null;
		}, 1000);
	}

	function handleClick(event: MouseEvent<HTMLButtonElement>) {
		domUtils.consumeDomEvent(event);
		if (checkClipboardAvailable()) {
			void navigator.clipboard
				.writeText(text())
				.then(() => {
					setButtonText(TEXT_SUCCESS);
					resetText();
				})
				.catch((error: unknown) => {
					console.error('Failed to copy text: ', error);
					setButtonText(TEXT_FAILURE);
					resetText();
				});
		} else {
			setButtonText(TEXT_FAILURE);
			console.error('Clipboard unavailable');
			resetText();
		}
	}

	if (!canCopy) {
		return null;
	}

	return (
		<button
			className={styles_buttons.copyClipboardButton}
			aria-label="Copy game states to clipboard"
			onClick={handleClick}
		>
			{buttonText}
		</button>
	);
}
