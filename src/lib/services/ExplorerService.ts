import { List } from '$lib/models/List';
import { ListService } from './ListService';

export class ExplorerService {
	private listService: ListService;

	constructor() {
		this.listService = new ListService();
	}

	// Create a new folder (which is a List in the backend)
	async createNewFolder(name?: string): Promise<List> {
		try {
			// Create a new custom list with the provided name or a default
			const folderName = name || 'New Folder';
			const newFolder = new List('custom', folderName);
			
			// Save the folder to the database
			const savedFolder = await this.listService.create(newFolder);
			
			console.log('✅ Folder created successfully:', savedFolder.name);
			return savedFolder;
		} catch (error) {
			console.error('❌ Failed to create folder:', error);
			throw new Error(`Failed to create folder: ${error}`);
		}
	}

	// Get all folders (lists)
	async getAllFolders(): Promise<List[]> {
		try {
			const lists = await this.listService.list();
			return lists.filter(list => list.type === 'custom');
		} catch (error) {
			console.error('Failed to get folders:', error);
			throw new Error(`Failed to get folders: ${error}`);
		}
	}

	// Delete a folder
	async deleteFolder(folderId: string): Promise<boolean> {
		try {
			console.log('Deleting folder:', folderId);
			const result = await this.listService.delete(folderId);
			console.log('Folder deleted successfully');
			return result;
		} catch (error) {
			console.error('Failed to delete folder:', error);
			throw new Error(`Failed to delete folder: ${error}`);
		}
	}

	// Rename a folder
	async renameFolder(folderId: string, newName: string): Promise<List> {
		try {
			const folder = await this.listService.read(folderId);
			if (!folder) {
				throw new Error('Folder not found');
			}
			
			folder.name = newName;
			const updatedFolder = await this.listService.update(folder);
			
			console.log('Folder renamed successfully:', newName);
			return updatedFolder;
		} catch (error) {
			console.error('Failed to rename folder:', error);
			throw new Error(`Failed to rename folder: ${error}`);
		}
	}
}

// Note: ExplorerService should be instantiated only in the browser
// Use: const explorerService = new ExplorerService();
