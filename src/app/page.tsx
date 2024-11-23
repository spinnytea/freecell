'use client';

import { useGSAP } from '@gsap/react';
import { gsap, Draggable } from 'gsap/all';
import GameBoard from '@/app/GameBoard';
import styles_gameboard from '@/app/gameboard.module.css';
import GameContextProvider from '@/app/hooks/contexts/Game/GameContextProvider';
import { SettingsContextProvider } from '@/app/hooks/contexts/Settings/SettingsContextProvider';

gsap.registerPlugin(useGSAP);
gsap.registerPlugin(Draggable);

// TODO (techdebt) unit test that clicks all the way through winning
export default function Page() {
	return (
		<SettingsContextProvider>
			<GameContextProvider>
				<GameBoard className={styles_gameboard.main} />
			</GameContextProvider>
		</SettingsContextProvider>
	);
}
