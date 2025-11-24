/**
 * Global Shortcuts Service
 * 
 * Easy-to-use service for managing keyboard shortcuts throughout the application.
 * 
 * Usage:
 * ```ts
 * const shortcuts = new ShortcutsService();
 * 
 * shortcuts.register({
 *   key: '+',
 *   modifiers: ['Alt'],
 *   handler: () => console.log('Option + pressed')
 * });
 * 
 * shortcuts.start(); // Start listening for shortcuts
 * shortcuts.stop();  // Stop listening for shortcuts
 * ```
 */

export interface ShortcutConfig {
	/** The main key (e.g., '+', '-', 'a', 'Enter') - uses event.key */
	key?: string;
	/** The physical key code (e.g., 'Equal', 'Minus', 'KeyA', 'Enter') - uses event.code. Prefer this for modifier combinations on Mac */
	code?: string;
	/** Modifier keys (e.g., ['Alt', 'Control', 'Shift', 'Meta']) */
	modifiers?: ('Alt' | 'Control' | 'Shift' | 'Meta')[];
	/** Handler function to execute when shortcut is pressed */
	handler: () => void;
	/** Optional description for debugging/documentation */
	description?: string;
	/** Whether to prevent default browser behavior (default: true) */
	preventDefault?: boolean;
}

export class ShortcutsService {
	private shortcuts: Map<string, ShortcutConfig> = new Map();
	private isListening = false;
	private keydownHandler: ((event: KeyboardEvent) => void) | null = null;

	/**
	 * Register a new keyboard shortcut
	 * @param config Shortcut configuration
	 * @returns A function to unregister this shortcut
	 */
	register(config: ShortcutConfig): () => void {
		const shortcutId = this.getShortcutId(config);
		
		if (this.shortcuts.has(shortcutId)) {
			console.warn(`Shortcut ${shortcutId} is already registered. Overwriting...`);
		}

		this.shortcuts.set(shortcutId, config);

		// If already listening, restart to pick up the new shortcut
		if (this.isListening) {
			this.stop();
			this.start();
		}

		// Return unregister function
		return () => {
			this.shortcuts.delete(shortcutId);
			if (this.isListening) {
				this.stop();
				this.start();
			}
		};
	}

	/**
	 * Unregister a shortcut by key/code and modifiers
	 */
	unregister(keyOrCode: string, modifiers?: ('Alt' | 'Control' | 'Shift' | 'Meta')[]): void {
		const shortcutId = this.buildShortcutId(keyOrCode, modifiers);
		this.shortcuts.delete(shortcutId);
		
		if (this.isListening) {
			this.stop();
			this.start();
		}
	}

	/**
	 * Start listening for keyboard shortcuts
	 */
	start(): void {
		if (this.isListening) {
			console.warn('ShortcutsService is already listening');
			return;
		}

		this.keydownHandler = (event: KeyboardEvent) => {
			this.handleKeydown(event);
		};

		window.addEventListener('keydown', this.keydownHandler);
		this.isListening = true;
	}

	/**
	 * Stop listening for keyboard shortcuts
	 */
	stop(): void {
		if (!this.isListening) {
			return;
		}

		if (this.keydownHandler) {
			window.removeEventListener('keydown', this.keydownHandler);
			this.keydownHandler = null;
		}

		this.isListening = false;
	}

	/**
	 * Get all registered shortcuts (for debugging)
	 */
	getRegisteredShortcuts(): ShortcutConfig[] {
		return Array.from(this.shortcuts.values());
	}

	/**
	 * Clear all registered shortcuts
	 */
	clear(): void {
		this.shortcuts.clear();
		if (this.isListening) {
			this.stop();
			this.start();
		}
	}

	/**
	 * Handle keydown event
	 */
	private handleKeydown(event: KeyboardEvent): void {
		const pressedKey = event.key;
		const pressedCode = event.code;
		const modifiers: ('Alt' | 'Control' | 'Shift' | 'Meta')[] = [];

		if (event.altKey) modifiers.push('Alt');
		if (event.ctrlKey) modifiers.push('Control');
		if (event.shiftKey) modifiers.push('Shift');
		if (event.metaKey) modifiers.push('Meta');

		// Try to find matching shortcut
		for (const config of this.shortcuts.values()) {
			if (this.matchesShortcut(event, config, pressedKey, pressedCode, modifiers)) {
				if (config.preventDefault !== false) {
					event.preventDefault();
					event.stopPropagation();
				}
				config.handler();
				return;
			}
		}
	}

	/**
	 * Check if the pressed keys match a shortcut configuration
	 */
	private matchesShortcut(
		event: KeyboardEvent,
		config: ShortcutConfig,
		pressedKey: string,
		pressedCode: string,
		pressedModifiers: ('Alt' | 'Control' | 'Shift' | 'Meta')[]
	): boolean {
		// Check main key - prefer code if provided (more reliable for modifier combinations)
		let keyMatches = false;
		
		if (config.code) {
			// Use physical key code (e.g., "Equal" for =/+ key)
			keyMatches = config.code === pressedCode;
		} else if (config.key) {
			// Use character key (case-insensitive for letter keys)
			keyMatches = 
				config.key.toLowerCase() === pressedKey.toLowerCase() ||
				config.key === pressedKey;
		} else {
			// Must have either key or code
			return false;
		}

		if (!keyMatches) {
			return false;
		}

		// Check modifiers
		const expectedModifiers = config.modifiers || [];
		
		// Must have exactly the expected modifiers (no more, no less)
		if (expectedModifiers.length !== pressedModifiers.length) {
			return false;
		}

		// Check that all expected modifiers are present
		for (const modifier of expectedModifiers) {
			if (!pressedModifiers.includes(modifier)) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Generate a unique ID for a shortcut configuration
	 */
	private getShortcutId(config: ShortcutConfig): string {
		const identifier = config.code || config.key || '';
		return this.buildShortcutId(identifier, config.modifiers);
	}

	/**
	 * Build a shortcut ID from key/code and modifiers
	 */
	private buildShortcutId(keyOrCode: string, modifiers?: ('Alt' | 'Control' | 'Shift' | 'Meta')[]): string {
		const sortedModifiers = (modifiers || []).sort().join('+');
		return `${sortedModifiers ? sortedModifiers + '+' : ''}${keyOrCode}`;
	}
}

// Export a singleton instance for convenience
export const shortcutsService = new ShortcutsService();

