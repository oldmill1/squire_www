import { writable } from 'svelte/store';

export const widgetVisibility = writable(false);

export function toggleWidgetVisibility() {
	widgetVisibility.update((visible) => !visible);
}

export function showWidget() {
	widgetVisibility.set(true);
}

export function hideWidget() {
	widgetVisibility.set(false);
}
