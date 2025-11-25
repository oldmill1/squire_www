import { writable } from 'svelte/store';

/**
 * Store for managing editor font size
 * Default font size: 1rem (16px)
 */
const DEFAULT_FONT_SIZE = 1.25;
const MIN_FONT_SIZE = 0.625; // 10px
const MAX_FONT_SIZE = 3; // 48px
const FONT_SIZE_STEP = 0.25;

function createEditorFontSizeStore() {
	const { subscribe, set, update } = writable<number>(DEFAULT_FONT_SIZE);

	return {
		subscribe,
		
		/**
		 * Increase font size by step amount
		 */
		increase: () => {
			update((size) => Math.min(size + FONT_SIZE_STEP, MAX_FONT_SIZE));
		},

		/**
		 * Decrease font size by step amount
		 */
		decrease: () => {
			update((size) => Math.max(size - FONT_SIZE_STEP, MIN_FONT_SIZE));
		},

		/**
		 * Set font size to a specific value
		 */
		set: (size: number) => {
			const clampedSize = Math.max(MIN_FONT_SIZE, Math.min(size, MAX_FONT_SIZE));
			set(clampedSize);
		},

		/**
		 * Reset to default font size
		 */
		reset: () => {
			set(DEFAULT_FONT_SIZE);
		},

		/**
		 * Get current font size (for one-time reads)
		 */
		get: () => {
			let currentSize = DEFAULT_FONT_SIZE;
			subscribe((size) => {
				currentSize = size;
			})();
			return currentSize;
		}
	};
}

export const editorFontSize = createEditorFontSizeStore();

