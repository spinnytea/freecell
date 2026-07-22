import type { Metadata } from 'next';
import '@/app/globals.css';
import { OfflineServiceWorker } from '@/app/OfflineServiceWorker';

export const metadata: Metadata = {
	title: 'freecell',
	description: 'card game',
	manifest: '/freecell/manifest.webmanifest',
	icons: {
		icon: '/freecell/manifest-icon.svg',
		shortcut: '/freecell/manifest-icon.svg',
		apple: '/freecell/manifest-icon.svg',
	},
};

// XXX (hud) red orange yellow green blue pruple?
//  -        sep oct    nov    dec   jan  feb
//  -        mar apr    may    jun   july aug
/*
// TODO (hud) change the color based on the month; this flickers on load
const UPDATE_BACKGROUND_COLOR = `
	const GLOBALS_CSS_COLOR_OPTIONS = [
		'var(--felt--electric-blue)',
		'var(--felt--championship-green)',
		'var(--felt--wine)',
	];
	const month = new Date().getMonth() + 1;
	const color = GLOBALS_CSS_COLOR_OPTIONS[month % GLOBALS_CSS_COLOR_OPTIONS.length];
	document.body.style.setProperty('--felt--selected', color);
`;
<head><Script id="colors" strategy="beforeInteractive">{UPDATE_BACKGROUND_COLOR}</Script></head>
*/

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>
				{children}
				<OfflineServiceWorker />
			</body>
		</html>
	);
}
