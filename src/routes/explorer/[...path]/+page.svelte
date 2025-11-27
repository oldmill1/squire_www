<script lang="ts">
	import { onMount } from 'svelte';
	import { List } from '$lib/models/List';
	import { Document } from '$lib/models/Document';
	import { ListService } from '$lib/services/ListService';
	import { DocumentService } from '$lib/services/DocumentService';
	import Explorer from '$lib/components/Explorer/Explorer.svelte';
	import MenuBar from '$lib/components/MenuBar/MenuBar.svelte';
	import { convertDocumentsToExplorerItems, createExplorerData } from '$lib/components/Explorer/utils';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let listService: ListService;
	let documentService: DocumentService;
	let list = $state<List | null>(null);
	let documents = $state<Document[]>([]);
	let hasLoaded = $state(false);
	let error = $state<string | null>(null);

	onMount(async () => {
		try {
			const { ListService } = await import('$lib/services/ListService');
			const { DocumentService } = await import('$lib/services/DocumentService');
			
			listService = new ListService();
			documentService = new DocumentService();

			// Load the list - first path segment is the list ID
			console.log('Raw path data:', data.path);
			console.log('Path type:', typeof data.path);
			
			// Handle both string and array cases for SvelteKit routing
			let pathArray: string[];
			if (typeof data.path === 'string') {
				pathArray = [data.path];
			} else {
				pathArray = data.path || [];
			}
			
			console.log('Processed path array:', pathArray);
			const listId = pathArray[0];
			console.log('Extracted listId:', listId);
			if (!listId) {
				error = 'No list specified';
				hasLoaded = true;
				return;
			}
			
			list = await listService.read(listId);
			if (!list) {
				error = 'List not found';
				hasLoaded = true;
				return;
			}

			// Load all documents and filter by this list
			const allDocuments = await documentService.list();
			
			// Filter documents that belong to this list
			documents = allDocuments.filter(doc => list!.hasItem(doc.id));

		} catch (err) {
			console.error('Failed to load list documents:', err);
			error = 'Failed to load list';
		} finally {
			hasLoaded = true;
		}
	});

	function handleDocumentClick(doc: Document, event: MouseEvent) {
		console.log('Document clicked:', doc.id, doc.title);
		// Navigate to the document in the Editor
		window.location.href = `/docs/${doc.id}`;
	}

	function handleBack() {
		window.location.href = '/explorer';
	}

	// Create standardized data for Explorer
	const explorerData = $derived.by(() => {
		if (!hasLoaded) return createExplorerData([], 'document', false);
		return createExplorerData(
			convertDocumentsToExplorerItems(documents, handleDocumentClick),
			'document',
			true
		);
	});
</script>

<MenuBar title={list?.name || 'List'} backButton={true} onBackClick={handleBack} />

<div class="explorer-container">
	{#if error}
		<div class="error-message">
			<p>{error}</p>
		</div>
	{:else}
		<Explorer data={explorerData} />
	{/if}
</div>

<style>
	.error-message {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 400px;
		color: #ff6b6b;
		font-size: 18px;
	}
</style>
