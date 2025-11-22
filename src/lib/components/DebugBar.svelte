<script lang="ts">
  import styles from './DebugBar.module.scss';
  import type { Snippet } from 'svelte';
  
  interface Props {
    onNewDocument?: () => void;
  }
  
  let { onNewDocument }: Props = $props();
  
  function handleNewDocument() {
    onNewDocument?.();
  }
</script>

<div class={styles.debugBar}>
  <button class={styles.debugButton} onclick={handleNewDocument}>
    New Document
  </button>
</div>
