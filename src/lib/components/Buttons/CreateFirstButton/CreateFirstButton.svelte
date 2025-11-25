<script lang="ts">
	import styles from './CreateFirstButton.module.scss';

	export let text: string = 'Create your first document';
	export let onclick: () => void = () => {};
</script>

<button class={styles['create-first-btn']} {onclick}>
	{text}
</button>
