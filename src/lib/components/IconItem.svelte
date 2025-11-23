<script lang="ts">
  import styles from './IconItem.module.scss';
  
  interface Props {
    name: string;
    icon?: string;
    onClick?: () => void;
  }
  
  let { name, icon = '/icons/folder.png', onClick }: Props = $props();
  
  function handleClick() {
    onClick?.();
  }
  
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  }
</script>

<div 
  class={styles.iconItem} 
  role="button"
  tabindex="0"
  onclick={handleClick}
  onkeydown={handleKeydown}
>
  <img 
    src={icon} 
    alt={name}
    class={styles.icon}
  />
  <span class={styles.label}>{name}</span>
</div>
