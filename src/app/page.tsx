import Link from 'next/link';
import styles_common from '@/app/common.module.css';

export default function Page() {
	return (
		<main className={styles_common.main}>
			<Link href="/manualtesting">Manual Testing</Link>
		</main>
	);
}
