<script lang="ts">
  import Editor from '$lib/components/Editor.svelte';
  import { onMount } from 'svelte';
  import { DatabaseService } from '$lib/services/DatabaseService';
  import type { PageProps } from './$types';
  
  let { data }: PageProps = $props();
  let documentContent = $state('');
  let dbService: DatabaseService | undefined;

  onMount(async () => {
    console.log('Loading document with ID:', data.id);
    try {
      // Initialize database service
      dbService = new DatabaseService('squiredb');
      console.log('Database service initialized');
      
      // Load the document
      const document = await dbService.read(data.id);
      console.log('Document loaded:', document);
      
      if (document) {
        documentContent = document.content;
        console.log('Document content set to:', documentContent);
      } else {
        console.log('No document found with ID:', data.id);
      }
    } catch (error) {
      console.error('Failed to load document:', error);
    }
  });
</script>

<Editor content={documentContent} documentId={data.id} {dbService} />
