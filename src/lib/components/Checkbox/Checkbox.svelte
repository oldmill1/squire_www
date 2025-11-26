<script lang="ts">
	import styles from './Checkbox.module.scss';
	
	export let checked = false;
	export let disabled = false;
	export let label = '';
	
	function handleChange() {
		if (!disabled) {
			checked = !checked;
		}
	}
</script>

<div class={styles.checkbox}>
	<label class={styles.checkboxLabel}>
		<input 
			type="checkbox" 
			{checked} 
			{disabled}
			on:change={handleChange}
			class={styles.checkboxInput}
		/>
		<span class={styles.checkboxCustom}></span>
		{#if label}
			<span class={styles.checkboxText}>{label}</span>
		{/if}
	</label>
</div>
