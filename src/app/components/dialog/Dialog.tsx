import { MouseEvent, useEffect, useRef } from 'react';
import classNames from 'classnames';
import styles_dialog from '@/app/components/dialog/dialog.module.css';

export default function Dialog({
	open = false,
	onClose,
	ariaLabel,
	className,
	children,
}: Readonly<{
	open?: boolean;
	onClose?: () => void;
	ariaLabel: string;
	className?: string;
	children: React.ReactNode;
}>) {
	const dialogRef = useRef<HTMLDialogElement | null>(null);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (dialog) {
			if (open) {
				dialog.showModal();
			} else {
				dialog.close();
			}
		}
	}, [open]);

	function handleClick(event: MouseEvent) {
		const dialog = dialogRef.current;
		// close on backdrop click
		if (dialog && event.target === dialog) {
			dialog.close();
		}
	}

	function handleClose() {
		if (onClose) onClose();
	}

	return (
		<dialog
			ref={dialogRef}
			aria-label={ariaLabel}
			className={classNames(className, styles_dialog.root)}
			onClick={handleClick}
			onClose={handleClose}
		>
			<form method="dialog">{children}</form>
		</dialog>
	);
}
