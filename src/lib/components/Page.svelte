<script lang="ts">
  import styles from './Page.module.scss';
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    description?: string;
    children: Snippet;
  }

  let { title, description, children }: Props = $props();
</script>

<svelte:head>
  <title>{title} - Squire</title>
  {#if description}
    <meta name="description" content={description} />
  {/if}
</svelte:head>

<div class={styles['page-container']}>
  {@render children()}
</div>
