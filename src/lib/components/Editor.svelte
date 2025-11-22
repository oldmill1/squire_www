<script lang="ts">
  import styles from './Editor.module.scss';
  import { onMount } from 'svelte';
  import { DatabaseService } from '$lib/services/DatabaseService';
  import { Document } from '$lib/models/Document';
  
  interface Props {
    content?: string;
    documentId?: string;
    dbService?: DatabaseService;
  }
  
  let { content = "", documentId, dbService }: Props = $props();
  
  // Reactive state for editor content
  let editorContent = $state(content);
  
  // Reference to the editable div
  let editableDiv: HTMLElement;
  
  // Debounce variables
  let debounceTimer: number;
  
  // Track the previous content to detect actual prop changes
  let previousContent = $state(content);
  
  // Set initial content after mount
  onMount(() => {
    if (editableDiv && content) {
      editableDiv.innerText = content;
      editorContent = content;
      previousContent = content;
    }
  });
  
  // Update content when prop changes from parent
  $effect(() => {
    if (editableDiv && content !== previousContent) {
      editableDiv.innerText = content;
      editorContent = content;
      previousContent = content;
    }
  });
  
  // Handle input events with debouncing
  async function handleInput(event: Event) {
    const target = event.target as HTMLElement;
    editorContent = target.innerText || '';
    
    // Clear existing timer
    clearTimeout(debounceTimer);
    
    // Set new timer
    debounceTimer = setTimeout(async () => {
      try {
        if (documentId && dbService) {
          // Load existing document
          const existingDoc = await dbService.read(documentId);
          
          if (existingDoc) {
            // Update content
            existingDoc.updateContent(editorContent);
            
            // Save to database
            await dbService.update(existingDoc);
            console.log('Document saved successfully');
          }
        }
      } catch (error) {
        console.error('Failed to save document:', error);
      }
    }, 500); // 500ms delay
  }
</script>

<div class={styles.editorContainer}>
  <div 
    class={styles.contentEditable}
    contenteditable="true"
    oninput={handleInput}
    bind:this={editableDiv}
  >
  </div>
</div>

