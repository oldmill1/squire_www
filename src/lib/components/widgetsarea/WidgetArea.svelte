<script lang="ts">
	import styles from './WidgetArea.module.scss';
	import type { Snippet } from 'svelte';
	import { widgetVisibility, hideWidget } from '$lib/stores/widgetVisibility';
	import AddToListWidget from './AddToListWidget.svelte';
	import RewriterWidget from './RewriterWidget.svelte';
	import { fade } from 'svelte/transition';

	interface Props {
		children?: Snippet;
		title?: string;
		variant?: 'default' | 'compact' | 'expanded';
		class?: string;
		documentId?: string;
		dbService?: any;
	}

	let { children, title, variant = 'default', class: className = '', documentId, dbService }: Props = $props();

	let isVisible = $state(true);

	// Subscribe to the store using Svelte 5 syntax
	$effect(() => {
		const unsubscribe = widgetVisibility.subscribe((value) => {
			isVisible = value;
		});
		return unsubscribe;
	});

	function toggleVisibility() {
		isVisible = !isVisible;
		widgetVisibility.set(isVisible);
	}
</script>

{#if isVisible}
	<div class={`${styles.widgetArea}`} transition:fade={{ duration: 300 }}>
		<div class={styles.contentContainer}>
			<div class={styles.content}>
				{#if documentId}
					<AddToListWidget {documentId} {dbService} />
					<RewriterWidget {documentId} {dbService} />
				{/if}

				{#if children}
					{@render children()}
				{:else if !documentId}
					<div class={styles.placeholder}>
						<p>Widget area content goes here</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
