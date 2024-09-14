import '@/app/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

// TODO (theme) pick any font(s) google fonts
const inter = Inter({ subsets: ['latin'] });

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
			<body className={inter.className}>{children}</body>
		</html>
	);
}
