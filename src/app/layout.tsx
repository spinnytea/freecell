import '@/app/globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'freecell',
	description: 'card game',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
