<script lang="ts">
  import { onMount } from 'svelte';
  import { DatabaseService } from '$lib/services/DatabaseService';
  import { ListService } from '$lib/services/ListService';
  import { Document } from '$lib/models/Document';
  import { List } from '$lib/models/List';
  import { DTable } from '$lib/components/data/DTable';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let dbService: DatabaseService;
  let listService: ListService;
  let items: (Document | List)[] = [];
  let loading = $state(true);
  let error = $state<string | null>(null);

  onMount(async () => {
    try {
      if (data.resource === 'documents') {
        const { DatabaseService } = await import('$lib/services/DatabaseService');
        dbService = new DatabaseService('squiredb');
        
        // Load documents from database
        const allDocs = await dbService.list();
        
        // Sort by createdAt (most recent first) and limit to 10
        items = allDocs
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 10);
      } else if (data.resource === 'lists') {
        const { ListService } = await import('$lib/services/ListService');
        listService = new ListService('squiredb');
        
        // Load lists from database
        const allLists = await listService.list();
        
        // Sort by createdAt (most recent first) and limit to 10
        items = allLists
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 10);
      }
      
    } catch (err) {
      console.error('Failed to load items:', err);
      error = `Failed to load ${data.resource} from database`;
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>{data.resource} - Data - Squire</title>
  <meta name="description" content="Data management page" />
</svelte:head>

<DTable 
  {items}
  resourceType={data.resource as 'documents' | 'lists'}
  {loading}
  {error}
  empty={items.length === 0 && !loading}
/>
