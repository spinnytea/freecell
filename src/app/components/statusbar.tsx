import Link from 'next/link';
import styles_gameboard from '@/app/gameboard.module.css';

export function StatusBar() {
	return (
		<section className={styles_gameboard.status}>
			<span className={styles_gameboard.statusspacer} />
			<Link href="/manualtesting">Manual Testing</Link>
		</section>
	);
}
