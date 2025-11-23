<script lang="ts">
  import styles from './Explorer.module.scss';
  import DocumentButton from './DocumentButton.svelte';
  import IconItem from '../global/IconItem.svelte';
  import Button from '../global/Button.svelte';
  import type { Snippet } from 'svelte';
  import { Document } from '$lib/models/Document';
  import { fade, slide, scale } from 'svelte/transition';
  
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
</script>

<div class={styles.container}>
  {#if children}
    {@render children()}
  {:else}
    <div class={styles.explorerBg}>
      <div class={styles.backButtonPosition}>
        <Button 
          onclick={() => window.history.back()}
          text="Back"
          icon="/icons/folder.png"
          alt="Back"
        />
      </div>
      <div class={styles.desktop}>
        {#if documents.length > 0}
          {#each documents as doc, index (doc.id)}
            <div 
              transition:scale={{ duration: 300, delay: (index * 50) }}
            >
              <DocumentButton 
                document={doc}
                {isSelectionMode}
                onDocumentClick={onDocumentClick || (() => {})}
                onSelectionChange={onSelectionChange}
              />
            </div>
          {/each}
        {:else if files.length > 0}
          {#each files as file, index (file.id)}
            <div 
              class={styles.fileItem}
              transition:slide={{ duration: 300, delay: (index * 50) }}
            >
              <IconItem 
                name={file.name}
                icon={file.icon ?? '/icons/folder.png'}
              />
            </div>
          {/each}
        {/if}
      </div>
      
      <div class={styles.empty}>
        {#if hasLoaded && documents.length === 0 && files.length === 0}
          <p transition:fade={{ duration: 300 }}>No documents found</p>
        {/if}
      </div>
    </div>
  {/if}
</div>
