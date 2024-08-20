import Link from 'next/link';
import styles_common from '@/app/common.module.css';

// REVIEW demo page - then delete it
export default function Page() {
	return (
		<main className={styles_common.main}>
			<div className={styles_common.description}>
				<Link href="/">
					<span>&lt;-</span> Back to game
				</Link>
				<Link href="/manualtesting">Manual Testing</Link>
			</div>

			<div className={styles_common.center}></div>

			<div className={styles_common.grid}>
				<a href="/demo" className={styles_common.card} target="_blank" rel="noopener noreferrer">
					<h2>
						Docs <span>-&gt;</span>
					</h2>
					<p>Find in-depth information about Next.js features and API.</p>
				</a>

				<a href="/demo" className={styles_common.card} target="_blank" rel="noopener noreferrer">
					<h2>
						Learn <span>-&gt;</span>
					</h2>
					<p>Learn about Next.js in an interactive course with&nbsp;quizzes!</p>
				</a>

				<a href="/demo" className={styles_common.card} target="_blank" rel="noopener noreferrer">
					<h2>
						Templates <span>-&gt;</span>
					</h2>
					<p>Explore starter templates for Next.js.</p>
				</a>

				<a href="/demo" className={styles_common.card} target="_blank" rel="noopener noreferrer">
					<h2>
						Deploy <span>-&gt;</span>
					</h2>
					<p>Instantly deploy your Next.js site to a shareable URL with Vercel.</p>
				</a>
			</div>
		</main>
	);
}
