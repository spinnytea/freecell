import { type MouseEvent, useState } from 'react';
import styles_buttons from '@/app/components/buttons.module.css';
import { domUtils } from '@/app/components/element/domUtils';

const TEXT_DEFAULT = 'Copy Game';
const TEXT_SUCCESS = 'Copied!';
const TEXT_FAILURE = 'Failed';

// FIXME If copy-paste current/history is normal, make a proper newline between them; put lines in quotes? Make a button?
export function CopyClipboardButton({ text }: { text: () => string }) {
	const [buttonText, setButtonText] = useState(TEXT_DEFAULT);

	// the clipboard may not always be available
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (!navigator?.clipboard?.writeText) {
		return null;
	}

	function resetText() {
		setTimeout(() => {
			setButtonText(TEXT_DEFAULT);
		}, 1000);
	}

	function handleClick(event: MouseEvent) {
		domUtils.consumeDomEvent(event);
		navigator.clipboard
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
