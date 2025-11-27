export type ListType = 'favorites' | 'custom';

export interface ListContent {
	id: string;
	type: ListType;
	name: string;
	itemIds: string[];
	parentId?: string;  // Parent folder ID for nesting
	createdAt: Date;
	updatedAt: Date;
}

export class List {
	private _id: string;
	private _type: ListType;
	private _name: string;
	private _itemIds: string[];
	private _parentId?: string;
	private _createdAt: Date;
	private _updatedAt: Date;

	constructor(type: ListType, customName?: string, parentId?: string) {
		this._id = crypto.randomUUID();
		this._type = type;
		this._name = type === 'favorites' ? 'favorites' : customName || '';
		this._itemIds = [];
		this._parentId = parentId;
		this._createdAt = new Date();
		this._updatedAt = new Date();
	}

	// Getters
	get id(): string {
		return this._id;
	}

	get type(): ListType {
		return this._type;
	}

	get name(): string {
		return this._name;
	}

	get itemIds(): string[] {
		return [...this._itemIds];
	}

	get createdAt(): Date {
		return this._createdAt;
	}

	get updatedAt(): Date {
		return this._updatedAt;
	}

	get parentId(): string | undefined {
		return this._parentId;
	}

	// Setters with automatic timestamp update
	set name(value: string) {
		if (this._type === 'custom') {
			this._name = value;
			this._updatedAt = new Date();
		}
	}

	// Methods
	addItem(itemId: string): void {
		if (!this._itemIds.includes(itemId)) {
			this._itemIds.push(itemId);
			this._updatedAt = new Date();
		}
	}

	removeItem(itemId: string): void {
		const index = this._itemIds.indexOf(itemId);
		if (index > -1) {
			this._itemIds.splice(index, 1);
			this._updatedAt = new Date();
		}
	}

	hasItem(itemId: string): boolean {
		return this._itemIds.includes(itemId);
	}

	clearItems(): void {
		this._itemIds = [];
		this._updatedAt = new Date();
	}

	// Serialize for storage
	toJSON(): ListContent {
		return {
			id: this._id,
			type: this._type,
			name: this._name,
			itemIds: [...this._itemIds],
			parentId: this._parentId,
			createdAt: this._createdAt,
			updatedAt: this._updatedAt
		};
	}

	// Create from JSON
	static fromJSON(data: ListContent): List {
		const list = new List(data.type, data.name, data.parentId);
		list._id = data.id;
		list._itemIds = [...data.itemIds];
		list._createdAt = new Date(data.createdAt);
		list._updatedAt = new Date(data.updatedAt);
		return list;
	}

	// Clone list
	clone(): List {
		return List.fromJSON(this.toJSON());
	}
}
