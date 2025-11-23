<script lang="ts">
  import styles from './Dock.module.scss';

  export let onNewDocument: () => void;
  export let onFavorites: () => void;
  export let onExplorer: () => void;
</script>

<div class={styles['dock']}>
  <button 
    class={styles['dock-item']} 
    onclick={onNewDocument}
    title="New Document"
  >
    <img src="/icons/new.png" alt="New Document" class={styles['dock-icon']} />
  </button>
  <button 
    class={styles['dock-item']} 
    onclick={onFavorites}
    title="Favorites"
  >
    <img src="/icons/heart.png" alt="Favorites" class={styles['dock-icon']} />
  </button>
  <button 
    class={styles['dock-item']} 
    onclick={onExplorer}
    title="Explorer"
  >
    <img src="/icons/folder.png" alt="Explorer" class={styles['dock-icon']} />
  </button>
</div>
