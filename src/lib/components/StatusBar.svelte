<script lang="ts">
	import styles from './StatusBar.module.scss';
	import type { Snippet } from 'svelte';
	import { savedNotification } from '$lib/stores/savedNotificationStore';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	interface Props {
		leftContent?: Snippet;
		middleContent?: Snippet;
		rightContent?: Snippet;
	}

	let { leftContent, middleContent, rightContent }: Props = $props();

	let showSavedNotification = $state(false);

	// Subscribe to saved notification store
	$effect(() => {
		const unsubscribe = savedNotification.subscribe((notification) => {
			showSavedNotification = notification.show;
		});
		return unsubscribe;
	});
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
		{#if showSavedNotification}
			<div class={styles.savedNotification} transition:fade={{ duration: 300 }}>
				<span class={styles.savedText}>Saved</span>
			</div>
		{:else if middleContent}
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
