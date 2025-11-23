<script lang="ts">
  import styles from './Explorer.module.scss';
  import IconItem from './IconItem.svelte';
  import type { Snippet } from 'svelte';
  import { Document } from '$lib/models/Document';
  import { selectedDocuments } from '$lib/stores/selectedDocuments';
  
  interface FileItem {
    id: string;
    name: string;
    type: 'folder' | 'file';
    icon?: string;
  }
  
  interface Props {
    children?: Snippet;
    files?: FileItem[];
    documents?: Document[];
    hasLoaded?: boolean;
    onDocumentClick?: (doc: Document, event: MouseEvent) => void;
    isSelectionMode?: boolean;
    onSelectionChange?: () => void;
  }
  
  let { 
    children, 
    files = [], 
    documents = [], 
    hasLoaded = true, 
    onDocumentClick,
    isSelectionMode = false,
    onSelectionChange
  }: Props = $props();
  
  // Simple reactive state for selected document IDs
  let selectedIds = $state<string[]>([]);
  
  // Update selected IDs from store
  function updateSelectedIds() {
    // Get all selected document IDs
    const ids: string[] = [];
    selectedDocuments.subscribe(state => {
      state.documents.forEach(doc => ids.push(doc.id));
    })();
    
    selectedIds = ids;
    
    // Notify parent of selection change
    if (onSelectionChange) {
      onSelectionChange();
    }
  }
  
  // Convert documents to file items for display
  const documentFiles = $derived(documents.map(doc => ({
    id: doc.id,
    name: doc.title || 'Untitled Document',
    type: 'file' as const,
    icon: '/icons/new.png'
  })));
  
  // Use documents if available, otherwise fall back to files or default
  const displayFiles = $derived(
    documents.length > 0 ? documentFiles : 
    files.length > 0 ? files : [
      { id: '1', name: 'Documents', type: 'folder', icon: '/icons/folder.png' },
      { id: '2', name: 'Pictures', type: 'folder', icon: '/icons/folder.png' },
      { id: '3', name: 'Downloads', type: 'folder', icon: '/icons/folder.png' }
    ]
  );

  function handleFileClick(fileId: string, event: MouseEvent) {
    if (onDocumentClick && documents.length > 0) {
      const doc = documents.find((d: Document) => d.id === fileId);
      if (doc) {
        if (isSelectionMode) {
          event.preventDefault();
          selectedDocuments.toggleDocument(doc);
          // Update our reactive state
          updateSelectedIds();
        } else {
          onDocumentClick(doc, event);
        }
      }
    }
  }
</script>

<div class={styles.container}>
  {#if children}
    {@render children()}
  {:else}
    <div class={styles.center}>
      <div class={styles.desktop}>
        {#if hasLoaded}
          {#each displayFiles as file (file.id)}
            {@const doc = documents.find((d: Document) => d.id === file.id)}
            {@const isSelected = selectedIds.includes(file.id)}
            {@const buttonClass = `${styles.documentButton} ${isSelectionMode ? styles.selectionMode : ''} ${isSelected ? styles.selected : ''}`}
            <button 
              type="button"
              class={buttonClass}
              onclick={(e) => handleFileClick(file.id, e)}
              onkeydown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleFileClick(file.id, e as any);
                }
              }}
            >
              {#if isSelectionMode && doc}
                <div class={styles.selectionCheckbox}>
                  <input 
                    type="checkbox" 
                    checked={isSelected}
                    style="pointer-events: none;"
                  />
                </div>
              {/if}
              <IconItem 
                name={file.name}
                icon={file.icon || '/icons/folder.png'}
              />
            </button>
          {/each}
        {:else}
          <div class={styles.loading}>
            <p>Loading documents...</p>
          </div>
        {/if}
      </div>
      
      {#if hasLoaded && documents.length === 0 && files.length === 0}
        <div class={styles.empty}>
          <p>No documents found</p>
        </div>
      {/if}
    </div>
  {/if}
</div>
