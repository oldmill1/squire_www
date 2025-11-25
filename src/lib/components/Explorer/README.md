# Explorer Component

The Explorer component displays a grid of items with a centered, scrolling interface.

## Interface

```typescript
interface ExplorerData {
	items: ExplorerItem[];
	type: 'list' | 'document';
	hasLoaded: boolean;
}

interface ExplorerItem {
	id: string;
	name: string;
	icon: string;
	onClick?: (item: ExplorerItem, event: MouseEvent) => void;
}
```

## Usage

```svelte
<script>
	import { convertListsToExplorerItems, createExplorerData } from '$lib/components/Explorer/utils';
	import Explorer from '$lib/components/Explorer/Explorer.svelte';

	const explorerData = createExplorerData(
		convertListsToExplorerItems(lists, handleListClick),
		'list',
		true
	);
</script>

<Explorer data={explorerData} />
```

## Utility Functions

- `convertListsToExplorerItems(lists, onListClick?)` - Converts Lists to ExplorerItems
- `convertDocumentsToExplorerItems(documents, onDocumentClick?)` - Converts Documents to ExplorerItems  
- `createExplorerData(items, type, hasLoaded)` - Creates ExplorerData object

## Visual Appearance

- Centered container with max-width
- Scrolling grid layout (4 columns)
- Custom scrollbar styling
- Hover effects on items
- Empty state handling
