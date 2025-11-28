'use client';

import { useGSAP } from '@gsap/react';
import classNames from 'classnames';
import { gsap, Draggable } from 'gsap/all';
import styles_common from '@/app/common.module.css';
import GameBoard from '@/app/GameBoard';
import styles_gameboard from '@/app/gameboard.module.css';
import GameContextProvider from '@/app/hooks/contexts/Game/GameContextProvider';
import { SettingsContextProvider } from '@/app/hooks/contexts/Settings/SettingsContextProvider';
import SettingsDialog from '@/app/SettingsDialog';

gsap.registerPlugin(useGSAP);
gsap.registerPlugin(Draggable);

// TODO (techdebt) unit test that clicks all the way through winning
export default function Page() {
	return (
		<SettingsContextProvider>
			<GameContextProvider>
				<GameBoard className={classNames(styles_common.page, styles_gameboard.main)} />
				<SettingsDialog />
			</GameContextProvider>
		</SettingsContextProvider>
	);
}
