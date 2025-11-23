<script lang="ts">
	import styles from './StatusBar.module.scss';
	import type { Snippet } from 'svelte';

	interface Props {
		leftContent?: Snippet;
		middleContent?: Snippet;
		rightContent?: Snippet;
	}

	let { leftContent, middleContent, rightContent }: Props = $props();
</script>

<div class={styles.statusBar}>
	<div class={styles.leftSection}>
		{#if leftContent}
			{@render leftContent()}
		{:else}
			<!-- Left section placeholder -->
		{/if}
	</div>

	<div class={styles.middleSection}>
		{#if middleContent}
			{@render middleContent()}
		{:else}
			<!-- Middle section placeholder -->
		{/if}
	</div>

	<div class={styles.rightSection}>
		{#if rightContent}
			{@render rightContent()}
		{:else}
			<!-- Right section placeholder -->
		{/if}
	</div>
</div>
