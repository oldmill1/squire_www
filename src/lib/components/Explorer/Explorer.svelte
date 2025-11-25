<script lang="ts">
	import styles from './Explorer.module.scss';
	import IconItem from '../global/IconItem.svelte';
	import Button from '../global/Button.svelte';
	import type { Snippet } from 'svelte';
	import { selectedDocuments } from '$lib/stores/selectedDocuments';
	import type { ExplorerData } from './types';

	interface Props {
		children?: Snippet;
		data: ExplorerData;
		isSelectionMode?: boolean;
		onSelectionChange?: () => void;
		onDeleteSelected?: (selectedDocuments: any[]) => void;
	}

	let {
		children,
		data,
		isSelectionMode = false,
		onSelectionChange,
		onDeleteSelected
	}: Props = $props();

	// Track selected documents from the store
	let selectedDocs = $state<any[]>([]);

	// Subscribe to selected documents store
	$effect(() => {
		const unsubscribe = selectedDocuments.subscribe((state) => {
			selectedDocs = state.documents;
		});

		return unsubscribe;
	});
</script>

<div class={styles.container}>
	{#if children}
		{@render children()}
	{:else}
		<div class={styles.explorerBg}>
			<div class={styles.desktop}>
			{#if data.hasLoaded}
				{#each data.items as item (item.id)}
					<div class={styles.fileItem}>
						<IconItem 
							name={item.name} 
							icon={item.icon} 
							onClick={() => item.onClick?.(item, new MouseEvent('click') as any)}
						/>
					</div>
				{/each}
			{/if}
		</div>

			{#if data.hasLoaded && data.items.length === 0}
				<div class={styles.centerMessage}>
					<p>Empty</p>
				</div>
			{/if}

			{#if isSelectionMode}
				<div class={styles.selectButtonPosition}>
					<Button
						onclick={() => onDeleteSelected?.(selectedDocs)}
						text="Delete"
						icon="/icons/trash-can.png"
						alt="Delete"
					/>
				</div>
			{/if}
		</div>
	{/if}
</div>
