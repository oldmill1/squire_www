<script lang="ts">
	import { onMount } from 'svelte';
	import { List } from '$lib/models/List';
	import { Document } from '$lib/models/Document';
	import { ListService } from '$lib/services/ListService';
	import { DocumentService } from '$lib/services/DocumentService';
	import Explorer from '$lib/components/Explorer/Explorer.svelte';
	import MenuBar from '$lib/components/MenuBar/MenuBar.svelte';
	import { convertDocumentsToExplorerItems, convertListsToExplorerItems, createExplorerData } from '$lib/components/Explorer/utils';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let listService: ListService;
	let documentService: DocumentService;
	let list = $state<List | null>(null);
	let documents = $state<Document[]>([]);
	let childFolders = $state<List[]>([]);
	let hasLoaded = $state(false);
	let error = $state<string | null>(null);
	let pathArray = $state<string[]>([]);
	let currentFolderId = $state<string | undefined>(undefined);
	let isSelectionMode = $state(false);
	let editingTempFolderId = $state<string | null>(null);
	let temporaryFolders = $state<any[]>([]);

	onMount(async () => {
		try {
			const { ListService } = await import('$lib/services/ListService');
			const { DocumentService } = await import('$lib/services/DocumentService');
			
			listService = new ListService();
			documentService = new DocumentService();

			// Load the list - first path segment is the list ID
			console.log('Raw path data:', data.path);
			console.log('Path type:', typeof data.path);
			console.log('Path constructor:', data.path.constructor.name);
			
			// Handle both string and array cases for SvelteKit routing
			if (typeof data.path === 'string') {
				console.log('Path is string, splitting by /');
				pathArray = (data.path as string).split('/').filter((segment: string) => segment.length > 0);
			} else if (Array.isArray(data.path)) {
				console.log('Path is array, using directly');
				pathArray = data.path;
			} else {
				console.log('Path is unexpected type, using empty array');
				pathArray = [];
			}
			
			console.log('Processed path array:', pathArray);
			// Take the LAST folder in the path as the current folder to load
			const listId = pathArray.length > 0 ? pathArray[pathArray.length - 1] : undefined;
			console.log('Extracted listId:', listId);
			
			// Set current folder ID for nested folder creation
			currentFolderId = listId;
			console.log('Set currentFolderId to:', currentFolderId);
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

			// Load child folders
			childFolders = await listService.getByParentId(currentFolderId);
			// Sort by creation date, newest first
			childFolders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
			console.log('Loaded child folders:', childFolders.map(f => ({ id: f.id, name: f.name, parentId: f.parentId })));

		} catch (err) {
			console.error('Failed to load list documents:', err);
			error = 'Failed to load list';
		} finally {
			hasLoaded = true;
		}
	});

	async function handleFolderCreate(folderName: string, tempId: string) {
		try {
			console.log('Creating folder:', folderName, 'from temp:', tempId);
			console.log('Using currentFolderId:', currentFolderId);
			
			// Create the real folder using ListService with parentId
			const newFolder = new List('custom', folderName, currentFolderId);
			const savedFolder = await listService.create(newFolder);
			
			console.log('Folder created successfully with parentId:', currentFolderId);
			
			// Remove the temporary folder
			temporaryFolders = temporaryFolders.filter(f => f.id !== tempId);
			
			// Clear editing state
			if (editingTempFolderId === tempId) {
				editingTempFolderId = null;
			}
			
			// Add the new folder to childFolders to show it immediately
			const updatedChildFolders = [...childFolders, savedFolder];
			// Sort by creation date, newest first
			updatedChildFolders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
			childFolders = updatedChildFolders;
			console.log('Added new folder to childFolders:', savedFolder.name);
			
			console.log('Folder creation completed - folder added to view');
			
		} catch (error) {
			console.error('Failed to create folder:', error);
		}
	}

	function handleDocumentClick(doc: Document, event: MouseEvent) {
		console.log('Document clicked:', doc.id, doc.title);
		// Navigate to the document in the Editor
		window.location.href = `/docs/${doc.id}`;
	}

	function handleFolderClick(folder: List, event: MouseEvent) {
		console.log('Folder clicked:', folder.id, folder.name);
		
		// Build the full path by appending current folder to existing path
		const fullPath = [...pathArray, folder.id];
		const navigationPath = fullPath.join('/');
		console.log('Navigating to full path:', navigationPath);
		
		// Navigate to the folder with full path
		window.location.href = `/explorer/${navigationPath}`;
	}

	function handleBack() {
		window.location.href = '/explorer';
	}

	function handleNewFolder() {
		console.log('New folder clicked');
		
		// Create a temporary folder with a unique ID and "New List" name
		const tempFolder = {
			id: `temp-${Date.now()}`, // Unique ID using timestamp
			name: 'New List',
			icon: '/icons/folder.png',
			onClick: (item: any, event: MouseEvent) => {
				// Handle click on temporary folder (optional - could open rename dialog)
			}
		};
		
		console.log('Created temp folder:', tempFolder.id);
		
		// Add to temporary folders array
		temporaryFolders = [...temporaryFolders, tempFolder];
		
		// Set this folder as the one being edited
		editingTempFolderId = tempFolder.id;
	}

	function handleSelectionToggle(enabled: boolean) {
		isSelectionMode = enabled;
	}

	async function handleDeleteSelected(selectedDocs: any[]) {
		// Basic delete functionality - can be expanded later
		console.log('Delete selected:', selectedDocs);
	}

	async function handleFolderRename(folderId: string, newName: string) {
		try {
			const currentList = await listService.read(folderId);
			if (!currentList) {
				console.error('List not found for renaming:', folderId);
				return;
			}
			
			currentList.name = newName;
			await listService.update(currentList);
			
			// Reload to show the updated name
			window.location.reload();
			
		} catch (error) {
			console.error('Failed to rename folder:', error);
		}
	}

	// Create standardized data for Explorer
	const explorerData = $derived.by(() => {
		if (!hasLoaded) return createExplorerData([], 'document', false);
		
		// Combine temporary folders, child folders, and documents
		const temporaryFolderItems = temporaryFolders.map(f => ({ ...f, isFolder: true }));
		const childFolderItems = convertListsToExplorerItems(childFolders, handleFolderClick);
		const documentItems = convertDocumentsToExplorerItems(documents, handleDocumentClick);
		
		// Show temporary folders FIRST, then child folders, then documents
		return createExplorerData(
			[...temporaryFolderItems, ...childFolderItems, ...documentItems],
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
		<Explorer 
			data={explorerData} 
			{isSelectionMode}
			showSelectionSwitch={true}
			onSelectionToggle={handleSelectionToggle}
			onDeleteSelected={handleDeleteSelected}
			onNewFolder={handleNewFolder}
			onFolderCreate={handleFolderCreate}
			onFolderRename={handleFolderRename}
			editingTempFolderId={editingTempFolderId}
		/>
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
