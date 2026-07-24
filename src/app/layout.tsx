import type { Metadata } from 'next';
import '@/app/globals.css';
import { OfflineServiceWorker } from '@/app/OfflineServiceWorker';

export const metadata: Metadata = {
	title: 'freecell',
	description: 'card game',
	manifest: '/freecell/manifest.webmanifest',
	icons: {
		icon: [
			{ url: '/freecell/favicon.svg', type: 'image/svg+xml' },
			{ url: '/freecell/favicon.ico', type: 'image/x-icon' },
			{ url: '/freecell/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
			{ url: '/freecell/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
			{ url: '/freecell/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
			{ url: '/freecell/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
		],
		shortcut: ['/freecell/favicon.svg'],
		apple: [{ url: '/freecell/favicon-180x180.png', sizes: '180x180', type: 'image/png' }],
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
