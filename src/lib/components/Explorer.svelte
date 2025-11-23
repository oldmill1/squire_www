<script lang="ts">
  import styles from './Explorer.module.scss';
  import IconItem from './IconItem.svelte';
  import type { Snippet } from 'svelte';
  
  interface FileItem {
    id: string;
    name: string;
    type: 'folder' | 'file';
    icon?: string;
  }
  
  interface Props {
    children?: Snippet;
    files?: FileItem[];
  }
  
  let { children, files = [] }: Props = $props();
  
  // Default files if none provided
  const displayFiles = $derived(files.length > 0 ? files : [
    { id: '1', name: 'Documents', type: 'folder', icon: '/icons/folder.png' },
    { id: '2', name: 'Pictures', type: 'folder', icon: '/icons/folder.png' },
    { id: '3', name: 'Downloads', type: 'folder', icon: '/icons/folder.png' }
  ]);
</script>

<div class={styles.container}>
  {#if children}
    {@render children()}
  {:else}
    <div class={styles.center}>
      <div class={styles.desktop}>
        {#each displayFiles as file (file.id)}
          <IconItem 
            name={file.name}
            icon={file.icon || '/icons/folder.png'}
          />
        {/each}
      </div>
    </div>
  {/if}
</div>
