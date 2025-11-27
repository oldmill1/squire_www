<script lang="ts">
	import { onMount } from 'svelte';
	import { List } from '$lib/models/List';
	import { Document } from '$lib/models/Document';
	import { ListService } from '$lib/services/ListService';
	import { DocumentService } from '$lib/services/DocumentService';
	import Explorer from '$lib/components/Explorer/Explorer.svelte';
	import MenuBar from '$lib/components/MenuBar/MenuBar.svelte';
	import Dock, { type DockItem } from '$lib/components/Dock/Dock.svelte';
	import type { ExplorerItem } from '$lib/components/Explorer/types';
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
	let editingTempDocumentId = $state<string | null>(null);
	let temporaryFolders = $state<any[]>([]);
	let temporaryDocuments = $state<ExplorerItem[]>([]);

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

			// Load child folders
			childFolders = await listService.getByParentId(currentFolderId);
			// Sort by creation date, newest first
			childFolders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
			console.log('Loaded child folders:', childFolders.map(f => ({ id: f.id, name: f.name, parentId: f.parentId })));

			// Load documents in this folder using parentId
			documents = await documentService.getByParentId(currentFolderId);
			// Sort by creation date, newest first
			documents.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
			console.log('Loaded documents in folder:', documents.map(d => ({ id: d.id, title: d.title, parentId: d.parentId })));

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

	async function handleDocumentCreate(documentName: string, tempId: string) {
		try {
			console.log('Creating document:', documentName, 'from temp:', tempId);
			console.log('Using currentFolderId:', currentFolderId);
			
			// Create the real document using DocumentService with parentId
			const newDocument = new Document(documentName, '', currentFolderId);
			const savedDocument = await documentService.create(newDocument);
			
			console.log('Document created successfully with parentId:', currentFolderId);
			
			// Remove the temporary document
			temporaryDocuments = temporaryDocuments.filter(d => d.id !== tempId);
			
			// Clear editing state
			if (editingTempDocumentId === tempId) {
				editingTempDocumentId = null;
			}
			
			// Add the new document to documents to show it immediately
			const updatedDocuments = [...documents, savedDocument];
			// Sort by creation date, newest first
			updatedDocuments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
			documents = updatedDocuments;
			console.log('Added new document to documents:', savedDocument.title);
			
			console.log('Document creation completed - document added to view');
			
		} catch (error) {
			console.error('Failed to create document:', error);
		}
	}

	function handleDocumentClick(doc: Document, event: MouseEvent) {
		console.log('Document clicked:', doc.id, doc.title);
		console.log('Document parentId:', doc.parentId); // Add this log
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

	function handleNewDocument() {
		console.log('New document clicked in folder:', currentFolderId);
		
		// Create a temporary document with a unique ID and "Untitled Document" name
		const tempDocument = {
			id: `temp-doc-${Date.now()}`, // Unique ID using timestamp
			name: 'Untitled Document',
			icon: '/icons/new.png',
			onClick: (item: any, event: MouseEvent) => {
				// Handle click on temporary document (optional - could open rename dialog)
			}
		};
		
		console.log('Created temp document:', tempDocument.id);
		console.log('Temp document object:', tempDocument);
		
		// Add to temporary documents array
		temporaryDocuments = [...temporaryDocuments, tempDocument];
		console.log('Temporary documents array:', temporaryDocuments);
		
		// Set this document as the one being edited
		editingTempDocumentId = tempDocument.id;
		console.log('Set editingTempDocumentId to:', editingTempDocumentId);
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
		
		// Combine temporary folders, temporary documents, child folders, and documents
		const temporaryFolderItems = temporaryFolders.map(f => ({ ...f, isFolder: true }));
		const temporaryDocumentItems = temporaryDocuments.map(d => ({ ...d, isFolder: false }));
		const childFolderItems = convertListsToExplorerItems(childFolders, handleFolderClick);
		const documentItems = convertDocumentsToExplorerItems(documents, handleDocumentClick);
		
		// Show temporary items FIRST, then child folders, then documents
		return createExplorerData(
			[...temporaryFolderItems, ...temporaryDocumentItems, ...childFolderItems, ...documentItems],
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
			onNewDocument={handleNewDocument}
			onFolderCreate={handleFolderCreate}
			onFolderRename={handleFolderRename}
			onDocumentCreate={handleDocumentCreate}
			editingTempFolderId={editingTempFolderId}
			editingTempDocumentId={editingTempDocumentId}
		/>
	{/if}
</div>

<Dock
	items={[
		{
			id: 'new-document',
			icon: '/icons/new.png',
			title: 'New Document',
			onClick: handleNewDocument
		}
	]}
/>

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
