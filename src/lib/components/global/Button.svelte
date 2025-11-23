<script lang="ts">
	import styles from './Button.module.scss';
	import type { Snippet } from 'svelte';

	interface Props {
		onclick: () => void;
		text: string;
		icon?: string;
		alt?: string;
	}

	let { onclick, text, icon, alt }: Props = $props();
</script>

<button class={styles['button']} {onclick} type="button">
	{#if icon}
		<img src={icon} alt={alt || 'Icon'} class={styles['button-icon']} />
	{/if}
	<span>{text}</span>
</button>
