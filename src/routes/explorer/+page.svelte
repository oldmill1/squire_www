<script lang="ts">
	import { onMount } from 'svelte';
	import { List } from '$lib/models/List';
	import { ListService } from '$lib/services/ListService';
	import { Document } from '$lib/models/Document';
	import { DocumentService } from '$lib/services/DocumentService';
	import Explorer from '$lib/components/Explorer/Explorer.svelte';
	import Dock, { type DockItem } from '$lib/components/Dock/Dock.svelte';
	import StatusBar from '$lib/components/Editor/StatusBar.svelte';
	import MenuBar from '$lib/components/MenuBar/MenuBar.svelte';
	import type { PageProps } from './$types';
	import { convertListsToExplorerItems, convertDocumentsToExplorerItems, createExplorerData } from '$lib/components/Explorer/utils';
	import styles from './+page.module.scss';

	let { data }: PageProps = $props();

	let listService: ListService;
	let documentService: DocumentService;
	let lists = $state<List[]>([]);
	let documents = $state<Document[]>([]);
	let hasLoaded = $state(false);
	let isSelectionMode = $state(false);

	onMount(async () => {
		try {
			const { ListService } = await import('$lib/services/ListService');
			const { DocumentService } = await import('$lib/services/DocumentService');
			listService = new ListService();
			documentService = new DocumentService();

			// Load lists
			const allLists = await listService.list();
			lists = allLists.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

			// Always load unlisted documents (recent ones not in any list)
			const allDocuments = await documentService.list();
			// TODO: Filter out documents that are already in lists when you have that data
			documents = allDocuments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
		} catch (error) {
			console.error('Failed to load lists or documents:', error);
		} finally {
			hasLoaded = true;
		}
	});

	function handleListClick(list: List, event: MouseEvent) {
		// Navigate to the list view
		window.location.href = `/explorer/${list.id}`;
	}

	function handleDocumentClick(document: Document, event: MouseEvent) {
		// Navigate to the document view
		window.location.href = `/docs/${document.id}`;
	}

	// Create standardized data for Explorer
	const explorerData = $derived.by(() => {
		if (!hasLoaded) return createExplorerData([], 'list', false);
		
		// Combine both lists and documents
		const listItems = convertListsToExplorerItems(lists, handleListClick);
		const documentItems = convertDocumentsToExplorerItems(documents, handleDocumentClick);
		
		// Show lists first, then unlisted documents
		return createExplorerData(
			[...listItems, ...documentItems],
			'list', // Keep as 'list' type for compatibility
			true
		);
	});

	function handleNewDocument() {
		console.log('New document clicked');
	}

	function handleFavorites() {
		console.log('Favorites clicked');
	}

	function handleSelectionToggle(enabled: boolean) {
		isSelectionMode = enabled;
	}

	async function handleDeleteSelected(selectedDocs: any[]) {
		if (!documentService && !listService) {
			return;
		}

		try {
			// Delete each selected item (could be document or list)
			const deletePromises = selectedDocs.map(async (doc) => {
				// Check if it's a document by trying to delete with document service
				if (documentService) {
					try {
						await documentService.delete(doc.id);
						return;
					} catch (error) {
						// Not a document, try list service
					}
				}
				
				// Try deleting as list
				if (listService) {
					await listService.delete(doc.id);
				}
			});

			await Promise.all(deletePromises);
			
			// Refresh both lists and documents
			const allLists = await listService.list();
			lists = allLists.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
			
			const allDocuments = await documentService.list();
			documents = allDocuments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
		} catch (error) {
			console.error('Failed to delete items:', error);
		}
	}
</script>

<MenuBar title="Explorer" />

<div class={styles['explorer-container']}>
	<!-- Using the new standardized data interface -->
	<Explorer 
		data={explorerData} 
		{isSelectionMode}
		showSelectionSwitch={true}
		onSelectionToggle={handleSelectionToggle}
		onDeleteSelected={handleDeleteSelected}
	/>

	<Dock
		items={[
			{
				id: 'new-document',
				icon: '/icons/new.png',
				title: 'New Document',
				onClick: handleNewDocument
			},
			{
				id: 'favorites',
				icon: '/icons/heart.png',
				title: 'Favorites',
				onClick: handleFavorites
			}
		]}
	/>
</div>
