<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { fade } from 'svelte/transition';
  import { List } from '$lib/models/List';
  import { ListService } from '$lib/services/ListService';
  import Dock, { type DockItem } from '$lib/components/Dock.svelte';
  import Button from '$lib/components/global/Button.svelte';
  import styles from './+page.module.scss';

  let listService: ListService;
  let isBrowser = false;
  let lists: List[] = [];
  let hasLoaded = false;

  onMount(async () => {
    isBrowser = true;
    
    try {
      const { ListService } = await import('$lib/services/ListService');
      listService = new ListService();
      console.log('ListService initialized successfully');
      
      // Load lists
      await loadLists();
    } catch (error) {
      console.error('Failed to initialize list service:', error);
    }
  });

  async function loadLists() {
    try {
      if (!listService) return;
      
      const allLists = await listService.list();
      console.log('Lists loaded:', allLists);
      
      // Sort by updatedAt to get the most recently updated lists
      lists = allLists.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    } catch (error) {
      console.error('Failed to load lists:', error);
    } finally {
      hasLoaded = true;
    }
  }

  async function handleNewList() {
    try {
      if (!isBrowser || !listService) {
        throw new Error('List service not initialized');
      }
      
      const newList = new List('custom', 'New List');
      const savedList = await listService.create(newList);
      
      console.log('New list created:', savedList.id);
      console.log('New list name:', savedList.name);
      
      // Refresh lists before navigating
      await loadLists();
      
      // For now, just reload the lists page
      // TODO: Navigate to list detail page when implemented
    } catch (error) {
      console.error('Failed to create new list:', error);
    }
  }

  function handleHome() {
    goto('/');
  }

  function handleExplorer() {
    goto('/explorer');
  }

  async function openList(listId: string) {
    // TODO: Navigate to list detail page when implemented
    console.log('Open list:', listId);
  }

  function handleListClick(list: List, event: MouseEvent) {
    openList(list.id);
  }
</script>

<svelte:head>
  <title>Lists - Squire</title>
  <meta name="description" content="Manage your document lists in Squire" />
</svelte:head>

<div class={styles['app-container']}>
  <!-- Main Content -->
  <main>
    <div class={styles['content-wrapper']}>
      <div class={styles['content-header']}>
        <h1 class={styles['lists-title']}>Lists</h1>
      </div>
      
      <div class={styles['lists-list']}>
        {#each lists as list (list.id)}
          <button 
            class={styles['list-item']} 
            onclick={(e) => handleListClick(list, e)}
            onkeydown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleListClick(list, e as any);
              }
            }}
            type="button"
            transition:fade={{ duration: 300 }}
          >
            <div class={styles['list-info']}>
              <h3 class={styles['list-name']}>{list.name || 'Untitled List'}</h3>
              <p class={styles['list-type']}>
                {list.type === 'favorites' ? 'Favorites' : 'Custom List'}
                {list.itemIds.length > 0 ? ` • ${list.itemIds.length} items` : ''}
              </p>
            </div>
            <div class={styles['list-arrow']}>→</div>
          </button>
        {/each}
        
        {#if hasLoaded && lists.length === 0}
          <div class={styles['empty-state']} transition:fade={{ duration: 300 }}>
            <p>No lists found</p>
            <button class={styles['create-first-btn']} onclick={handleNewList}>
              Create your first list
            </button>
          </div>
        {/if}
      </div>
      
      <div class={styles['list-controls']}>
        <Button 
          onclick={handleNewList}
          text="New List"
          icon="/icons/new.png"
          alt="New List"
        />
      </div>
    </div>
  </main>

  <!-- Dock -->
  <Dock 
    items={[
      {
        id: 'home',
        icon: '/icons/home.png',
        title: 'Home',
        onClick: handleHome
      },
      {
        id: 'new-list',
        icon: '/icons/new.png',
        title: 'New List',
        onClick: handleNewList
      },
      {
        id: 'explorer',
        icon: '/icons/folder.png',
        title: 'Explorer',
        onClick: handleExplorer
      }
    ]}
  />
</div>
