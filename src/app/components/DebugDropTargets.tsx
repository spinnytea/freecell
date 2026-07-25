import React, { CSSProperties, useEffect, useReducer } from 'react';
import classNames from 'classnames';
import styles_debug_local from '@/app/components/debug_local.module.css';
import type { DropTarget } from '@/app/hooks/controls/useDragAndDropControls';
import { shorthandLocation } from '@/game/card/card';

export function DebugDropTargets({ dropTargets }: { dropTargets: DropTarget[] | undefined }) {
	// dropTargets is based on a ref, so it won't rerender
	//  - here we use animation to forcibly rerender
	//  - this is a debug tool that's commented out, so it really doesn't matter
	//  - requestAnimationFrame is performant enough, even if it is a bit of an infinite loop
	const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
	const dropTargetCount = dropTargets?.length ?? 0;
	useEffect(() => {
		if (!dropTargetCount) return;

		let timeoutId: number;
		function again() {
			// console.log('rerender');
			timeoutId = requestAnimationFrame(() => {
				forceUpdate();
				again();
			});
			return timeoutId;
		}
		timeoutId = again();
		return () => {
			cancelAnimationFrame(timeoutId);
		};
	}, [forceUpdate, dropTargetCount]);

	if (!dropTargets?.length) return null;

	return (
		<div id="droptargets">
			{dropTargets.map((dropTarget) => (
				<React.Fragment key={`droptarget-${shorthandLocation(dropTarget.location)}`}>
					<DropTarget dropTarget={dropTarget} />
					<DropTargetBubble dropTarget={dropTarget} />
				</React.Fragment>
			))}
		</div>
	);
}

function DropTarget({ dropTarget }: { dropTarget: DropTarget }) {
	const id = `droptarget-${shorthandLocation(dropTarget.location)}-${dropTarget.shorthand ?? 'pile'}`;
	const style: CSSProperties = {
		left: dropTarget.cardCoords.left + dropTarget.cardCoords.width / 2 - dropTarget.cardMaxDist,
		top: dropTarget.cardCoords.top + dropTarget.cardCoords.height / 2 - dropTarget.cardMaxDist,
		width: dropTarget.cardMaxDist * 2,
		height: dropTarget.cardMaxDist * 2,
	};
	return <div id={id} className={styles_debug_local.cardMaxDist} style={style}></div>;
}

function DropTargetBubble({ dropTarget }: { dropTarget: DropTarget }) {
	const id = `droptargetbubble-${shorthandLocation(dropTarget.location)}-${dropTarget.shorthand ?? 'pile'}`;
	const className = classNames(styles_debug_local.cardDistance, {
		[styles_debug_local.isAvailableMove]: dropTarget.isAvailableMove,
		[styles_debug_local.isOverlapping]: dropTarget.isOverlapping,
	});
	const style: CSSProperties = {
		left: dropTarget.cardCoords.left + dropTarget.cardCoords.width / 2 - dropTarget.cardDistance,
		top: dropTarget.cardCoords.top + dropTarget.cardCoords.height / 2 - dropTarget.cardDistance,
		width: dropTarget.cardDistance * 2,
		height: dropTarget.cardDistance * 2,
	};
	return <div id={id} className={className} style={style}></div>;
}
