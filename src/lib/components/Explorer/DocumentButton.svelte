<script lang="ts">
	import styles from './DocumentButton.module.scss';
	import IconItem from '../global/IconItem.svelte';
	import { Document } from '$lib/models/Document';
	import { selectedDocuments } from '$lib/stores/selectedDocuments';

	interface Props {
		document: Document;
		isSelectionMode: boolean;
		onDocumentClick: (doc: Document, event: MouseEvent) => void;
		onSelectionChange?: () => void;
	}

	let { document, isSelectionMode, onDocumentClick, onSelectionChange }: Props = $props();

	// Reactive selection state
	let selectedIds = $state<string[]>([]);

	function updateSelectedIds() {
		const ids: string[] = [];
		selectedDocuments.subscribe((state) => {
			state.documents.forEach((doc) => ids.push(doc.id));
		})();

		selectedIds = ids;

		// Notify parent of selection change
		if (onSelectionChange) {
			onSelectionChange();
		}
	}

	const isSelected = $derived(selectedIds.includes(document.id));

	function handleClick(event: MouseEvent) {
		if (isSelectionMode) {
			event.preventDefault();
			selectedDocuments.toggleDocument(document);
			updateSelectedIds();
		} else {
			onDocumentClick(document, event);
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleClick(event as any);
		}
	}
</script>

<button
	type="button"
	class={`${styles.documentButton} ${isSelectionMode ? styles.selectionMode : ''} ${isSelected ? styles.selected : ''}`}
	onclick={handleClick}
	onkeydown={handleKeydown}
>
	{#if isSelectionMode}
		<div class={styles.selectionCheckbox}>
			<input type="checkbox" checked={isSelected} style="pointer-events: none;" />
		</div>
	{/if}
	<IconItem name={document.title || 'Untitled Document'} icon="/icons/new.png" />
</button>
