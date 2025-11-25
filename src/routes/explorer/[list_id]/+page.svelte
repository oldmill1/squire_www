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

			// Load the list
			list = await listService.read(data.listId);
			if (!list) {
				error = 'List not found';
				hasLoaded = true;
				return;
			}

			// Load all documents and filter by this list
			const allDocuments = await documentService.list();
			
			// If no documents exist, create some sample documents for testing
			if (allDocuments.length === 0) {
				console.log('No documents found, creating sample documents...');
				const sampleDocuments = [
					new Document('Chapter 1', 'Once upon a time...'),
					new Document('Chapter 2', 'The adventure continues...'),
					new Document('Notes', 'Some important notes here...'),
					new Document('Ideas', 'Brainstorming ideas...')
				];
				
				for (const sampleDoc of sampleDocuments) {
					const createdDoc = await documentService.create(sampleDoc);
					// Add the created document to this list
					list.addItem(createdDoc.id);
				}
				
				// Update the list with the new document IDs
				await listService.update(list);
				
				// Reload documents
				const reloadDocuments = await documentService.list();
				documents = reloadDocuments.filter(doc => list!.hasItem(doc.id));
			} else {
				// Filter documents that belong to this list
				documents = allDocuments.filter(doc => list!.hasItem(doc.id));
				
				// If this list has no documents, add some existing ones for testing
				if (documents.length === 0 && allDocuments.length > 0) {
					console.log('List has no documents, adding some for testing...');
					// Add first 3 documents to this list
					const docsToAdd = allDocuments.slice(0, 3);
					for (const doc of docsToAdd) {
						list.addItem(doc.id);
					}
					await listService.update(list);
					documents = docsToAdd;
				}
			}

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
