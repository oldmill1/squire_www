<script lang="ts">
	import styles from '../Explorer.module.scss';
	import IconItem from '../IconItem/IconItem.svelte';
	import SwitchMini from '../../SwitchMini/SwitchMini.svelte';
	import { Motion } from 'svelte-motion';

	interface Props {
		item: any;
		isSelectionMode?: boolean;
		isSelected?: boolean;
		onItemClick?: (item: any, event: MouseEvent) => void;
		onToggleSelection?: (item: any) => void;
	}

	let {
		item,
		isSelectionMode = false,
		isSelected = false,
		onItemClick,
		onToggleSelection
	}: Props = $props();

	function applyMotion(node: any, motionAction: any) {
		return motionAction(node);
	}

	function handleClick(event: MouseEvent) {
		onItemClick?.(item, event);
	}

	function handleToggleSelection() {
		onToggleSelection?.(item);
	}

	function handleSwitchChange() {
		onToggleSelection?.(item);
	}
</script>

<Motion 
	let:motion
	whileHover={{ 
		scale: 1.03,
		y: -2,
		transition: { type: "spring", stiffness: 400 }
	}}
	whileTap={{ scale: 0.98 }}
	transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
>
	<div 
		class={`${styles.fileItem} ${isSelectionMode ? styles.selectionMode : ''} ${isSelected ? styles.selected : ''}`}
		use:motion
	>
		{#if isSelectionMode}
			<div class={styles.selectionCheckbox}>
				<SwitchMini
					checked={isSelected}
					onchange={handleSwitchChange}
					onclick={(e: MouseEvent) => e.stopPropagation()}
				/>
			</div>
		{/if}
		<IconItem 
			name={item.name} 
			icon={item.icon} 
			onClick={handleClick}
		/>
	</div>
</Motion>
