<script lang="ts">
  import { fade } from 'svelte/transition';
  import { Document } from '$lib/models/Document';
  import { selectedDocuments } from '$lib/stores/selectedDocuments';
  import styles from './VList.module.scss';

  export let items: Document[] = [];
  export let hasLoaded: boolean = false;
  export let isSelectionMode: boolean = false;
  export let emptyMessage: string = 'No recent documents';
  export let emptyButtonText: string = 'Create your first document';
  export let onEmptyButtonClick: () => void = () => {};
  export let onItemClick: (doc: Document, event: MouseEvent) => void = () => {};
  export let onToggleSelection: (doc: Document) => void = () => {};

  function handleDocumentClick(doc: Document, event: MouseEvent) {
    onItemClick(doc, event);
  }

  function toggleDocumentSelection(doc: Document) {
    onToggleSelection(doc);
  }
</script>

<div class={styles['documents-list']}>
  {#each items as doc (doc.id)}
    <button 
      class={`${styles['document-item']} ${isSelectionMode ? styles['selection-mode'] : ''} ${selectedDocuments.isSelected(doc.id) ? styles['selected'] : ''}`} 
      onclick={(e) => handleDocumentClick(doc, e)}
      onkeydown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleDocumentClick(doc, e as any);
        }
      }}
      type="button"
      transition:fade={{ duration: 300 }}
    >
      {#if isSelectionMode}
        <div class={styles['selection-checkbox']}>
          <input 
            type="checkbox" 
            checked={selectedDocuments.isSelected(doc.id)}
            onchange={() => toggleDocumentSelection(doc)}
            onclick={(e) => e.stopPropagation()}
          />
        </div>
      {/if}
      <div class={styles['document-info']}>
        <h3 class={styles['document-title']}>{doc.title || 'Untitled Document'}</h3>
        <p class={styles['document-preview']}>
          {doc.content ? doc.content.slice(0, 100) : ''}
        </p>
      </div>
      <div class={styles['document-arrow']}>→</div>
    </button>
  {/each}
  
  {#if hasLoaded && items.length === 0}
    <div class={styles['empty-state']} transition:fade={{ duration: 300 }}>
      <p>{emptyMessage}</p>
      <button class={styles['create-first-btn']} onclick={onEmptyButtonClick}>
        {emptyButtonText}
      </button>
    </div>
  {/if}
</div>
