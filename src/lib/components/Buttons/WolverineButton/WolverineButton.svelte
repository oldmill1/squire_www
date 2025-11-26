<script lang="ts">
	import { Motion, M } from 'svelte-motion';
	import styles from './WolverineButton.module.scss';
	
	export let text: string = 'Create your first document';
	export let onclick: () => void = () => {};
	export let width: string = '190px';
	export let topDrawerText: string = 'expires in...';
	export let bottomDrawerText: string = '...8 hours';
	
	let isHovered = false;
	let isActive = false;
	
	// Wrapper function to handle SVG type compatibility
	function applyMotion(node: any, motionAction: any) {
		return motionAction(node);
	}
</script>

<Motion 
	let:motion
	whileHover={{ 
		scale: 1.05
	}}
	whileTap={{ 
		scale: 0.95
	}}
	transition={{ 
		duration: 0.25,
		ease: [0, 0, 0, 2.5]
	}}
>
	<div 
		class={styles['btn-container']}
		use:motion
		role="button"
		tabindex="0"
		style="max-width: {width};"
		onmouseenter={() => isHovered = true}
		onmouseleave={() => isHovered = false}
		onmousedown={() => isActive = true}
		onmouseup={() => isActive = false}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				isActive = true;
				isHovered = true;
			}
		}}
		onkeyup={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				isActive = false;
				isHovered = false;
			}
		}}
	>
		<!-- Top Drawer -->
		<Motion 
			let:motion
			animate={isHovered ? {
				y: -24,
				rotate: 4,
				opacity: 1
			} : {
				y: 0,
				opacity: 0
			}}
			whileTap={{ 
				y: 0,
				scale: 0.5,
				opacity: 1
			}}
			transition={{ 
				duration: 0.125,
				ease: [0, 0, 0, 2.5]
			}}
		>
			<div class={`${styles['btn-drawer']} ${styles['transition-top']}`} use:motion>
				{topDrawerText}
			</div>
		</Motion>

		<!-- Bottom Drawer -->
		<Motion 
			let:motion
			animate={isHovered ? {
				y: 24,
				rotate: 4,
				opacity: 1
			} : {
				y: 0,
				opacity: 0
			}}
			whileTap={{ 
				y: 0,
				scale: 0.5,
				opacity: 1
			}}
			transition={{ 
				duration: 0.125,
				ease: [0, 0, 0, 2.5]
			}}
		>
			<div class={`${styles['btn-drawer']} ${styles['transition-bottom']}`} use:motion>
				{bottomDrawerText}
			</div>
		</Motion>

		<button class={styles.btn} {onclick}>
			<span class={styles['btn-text']}>{text}</span>
		</button>

		<!-- Corner SVGs -->
		<div
			class={styles['btn-corner']}
			style="position: absolute; top: -24px; left: -24px; transform: rotate(180deg); transition: all 0.25s ease;"
			class:isHovered
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="-1 1 32 32"
			>
				<path
					d="M0,32C17.645,32,32,17.645,32,0h-0.985c0,17.102-13.913,31.015-31.015,31.015v0.985Z"
				></path>
			</svg>
		</div>

		<div
			class={styles['btn-corner']}
			style="position: absolute; top: -24px; right: -24px; transform: rotate(270deg); transition: all 0.25s ease;"
			class:isHovered
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="-1 1 32 32"
			>
				<path
					d="M0,32C17.645,32,32,17.645,32,0h-0.985c0,17.102-13.913,31.015-31.015,31.015v0.985Z"
				></path>
			</svg>
		</div>

		<div
			class={styles['btn-corner']}
			style="position: absolute; bottom: -24px; right: -24px; transform: rotate(0deg); transition: all 0.25s ease;"
			class:isHovered
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="-1 1 32 32"
			>
				<path
					d="M0,32C17.645,32,32,17.645,32,0h-0.985c0,17.102-13.913,31.015-31.015,31.015v0.985Z"
				></path>
			</svg>
		</div>

		<div
			class={styles['btn-corner']}
			style="position: absolute; bottom: -24px; left: -24px; transform: rotate(90deg); transition: all 0.25s ease;"
			class:isHovered
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="-1 1 32 32"
			>
				<path
					d="M0,32C17.645,32,32,17.645,32,0h-0.985c0,17.102-13.913,31.015-31.015,31.015v0.985Z"
				></path>
			</svg>
		</div>
	</div>
</Motion>
