<script lang="ts">
	import styles from './ExplorerNav.module.scss';
	import type { Snippet } from 'svelte';
	import { Motion } from 'svelte-motion';

	interface NavItem {
		id: string;
		label: string;
		icon?: string;
		onClick?: () => void;
		disabled?: boolean;
		active?: boolean;
	}

	interface Props {
		content?: NavItem[];
	}

	let { content = [] }: Props = $props();

	function applyMotion(node: any, motionAction: any) {
		return motionAction(node);
	}
</script>

<nav class={styles.explorerNav}>
	{#each content as item}
		<Motion 
			let:motion
			initial={false}
			whileHover={!item.disabled ? { 
				scale: 1.05,
				y: -2
			} : {}}
			whileTap={!item.disabled ? { 
				scale: 0.95,
				y: 0
			} : {}}
			transition={{ 
				duration: 0.3, 
				ease: [0.4, 0, 0.2, 1] 
			}}
		>
			<button
				class="{styles.navButton} {item.active ? styles.active : ''} {item.disabled ? styles.disabled : ''}"
				onclick={item.onClick}
				disabled={item.disabled}
				use:motion
			>
				{#if item.icon}
					<Motion 
						let:motion
						initial={false}
						whileHover={!item.disabled ? { 
							scale: 1.2,
							rotate: 5
						} : {}}
						transition={{ 
							duration: 0.3, 
							ease: [0.4, 0, 0.2, 1] 
						}}
					>
						<span class={styles.icon} use:motion>{item.icon}</span>
					</Motion>
				{/if}
				<span class={styles.label}>{item.label}</span>
			</button>
		</Motion>
	{/each}
</nav>
