<script lang="ts">
	import styles from './Explorer.module.scss';
	import IconItem from '../global/IconItem.svelte';
	import Button from '../global/Button.svelte';
	import Switch from '../Buttons/Switch/Switch.svelte';
	import type { Snippet } from 'svelte';
	import { selectedDocuments } from '$lib/stores/selectedDocuments';
	import type { ExplorerData } from './types';

	interface Props {
		children?: Snippet;
		data: ExplorerData;
		isSelectionMode?: boolean;
		onSelectionChange?: () => void;
		onDeleteSelected?: (selectedDocuments: any[]) => void;
		showSelectionSwitch?: boolean;
		onSelectionToggle?: (enabled: boolean) => void;
	}

	let {
		children,
		data,
		isSelectionMode = false,
		onSelectionChange,
		onDeleteSelected,
		showSelectionSwitch = false,
		onSelectionToggle
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

	function handleSelectionToggle() {
		const newMode = !isSelectionMode;
		console.log('Selection mode toggled:', newMode ? 'ON' : 'OFF');
		onSelectionToggle?.(newMode);
	}

	function handleItemClick(item: any, event: MouseEvent) {
		if (isSelectionMode) {
			event.preventDefault();
			toggleItemSelection(item);
		} else {
			item.onClick?.(item, event);
		}
	}

	function toggleItemSelection(item: any) {
		if (selectedDocuments.isSelected(item.id)) {
			selectedDocuments.removeDocument(item.id);
		} else {
			selectedDocuments.addDocument(item);
		}
		onSelectionChange?.();
		
		// Log currently selected documents
		const currentSelection = selectedDocuments.getDocuments();
		console.log('Currently selected documents:', currentSelection.map(doc => ({
			id: doc.id,
			name: (doc as any).name || doc.title || 'Untitled'
		})));
	}

	function checkIfSelected(item: any): boolean {
		return selectedDocs.some((doc) => doc.id === item.id);
	}
</script>

<div class={styles.container}>
	{#if children}
		{@render children()}
	{:else}
		<div class={styles.explorerBg}>
			<div class={styles.desktop}>
			{#if data.hasLoaded}
				{#each data.items as item (item.id)}
					<div class={`${styles.fileItem} ${isSelectionMode ? styles.selectionMode : ''} ${checkIfSelected(item) ? styles.selected : ''}`}>
						{#if isSelectionMode}
							<div class={styles.selectionCheckbox}>
								<input
									type="checkbox"
									checked={checkIfSelected(item)}
									onchange={() => toggleItemSelection(item)}
									onclick={(e) => e.stopPropagation()}
								/>
							</div>
						{/if}
						<IconItem 
							name={item.name} 
							icon={item.icon} 
							onClick={() => handleItemClick(item, new MouseEvent('click') as any)}
						/>
					</div>
				{/each}
			{/if}
		</div>

			<!-- Selection switch -->
			{#if showSelectionSwitch && data.hasLoaded && data.items.length > 0}
				<div class={styles.selectionSwitch}>
					<Switch 
						checked={isSelectionMode} 
						onchange={handleSelectionToggle}
					/>
					<span class={styles.switchLabel}>
						{isSelectionMode ? 'Selection Mode' : 'File Mode'}
					</span>
				</div>
			{/if}

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
