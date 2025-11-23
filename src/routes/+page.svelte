<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { fade } from 'svelte/transition';
  import { Document } from '$lib/models/Document';
  import { DatabaseService } from '$lib/services/DatabaseService';

  let dbService: DatabaseService;
  let isBrowser = false;
  let recentDocs: Document[] = [];
  let selectedCategory = 'Recents';
  let hasLoaded = false;

  onMount(async () => {
    isBrowser = true;
    
    try {
      const { DatabaseService } = await import('$lib/services/DatabaseService');
      dbService = new DatabaseService('squiredb');
      console.log('PouchDB "squiredb" initialized successfully');
      
      // Load recent documents
      await loadRecentDocs();
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  });

  async function loadRecentDocs() {
    try {
      if (!dbService) return;
      
      const docs = await dbService.list();
      recentDocs = docs.slice(0, 6); // Show last 6 documents
    } catch (error) {
      console.error('Failed to load recent documents:', error);
    } finally {
      hasLoaded = true;
    }
  }

  async function handleNewDocument() {
    try {
      if (!isBrowser || !dbService) {
        throw new Error('Database not initialized');
      }
      
      const newDoc = new Document('Untitled Document', '');
      const savedDoc = await dbService.create(newDoc);
      
      console.log('New document created:', savedDoc.id);
      await goto(`/docs/${savedDoc.id}`);
    } catch (error) {
      console.error('Failed to create new document:', error);
    }
  }

  async function openDocument(docId: string) {
    await goto(`/docs/${docId}`);
  }
</script>

<svelte:head>
  <title>Squire</title>
</svelte:head>

<div class="app-container">
  <!-- Main Content -->
  <main class="main-content">
    <div class="content-wrapper">
      <div class="content-header">
        <h1 class="recents-title">Recents</h1>
      </div>
      
      <div class="documents-list">
        {#each recentDocs as doc (doc.id)}
          <button 
            class="document-item" 
            onclick={() => openDocument(doc.id)}
            onkeydown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openDocument(doc.id);
              }
            }}
            type="button"
            transition:fade={{ duration: 300 }}
          >
            <div class="document-info">
              <h3 class="document-title">{doc.title || 'Untitled Document'}</h3>
              <p class="document-preview">
                {doc.content.slice(0, 100) || 'Empty document...'}
              </p>
            </div>
            <div class="document-arrow">→</div>
          </button>
        {/each}
        
        {#if hasLoaded && recentDocs.length === 0}
          <div class="empty-state" transition:fade={{ duration: 300 }}>
            <p>No recent documents</p>
            <button class="create-first-btn" onclick={handleNewDocument}>
              Create your first document
            </button>
          </div>
        {/if}
      </div>
    </div>
  </main>
</div>

<style>
  .app-container {
    display: flex;
    height: 100vh;
    background: #1a1a1a;
    color: #e0e0e0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  /* Main Content */
  .main-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #1a1a1a;
    overflow: hidden;
  }

  .content-wrapper {
    width: 100%;
    max-width: 600px;
    padding: 2rem;
    max-height: 100vh;
    overflow-y: auto;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
  }

  .content-wrapper::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }

  .content-header {
    text-align: center;
    margin-bottom: 2rem;
    position: relative;
  }

  .recents-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #ffffff;
    margin: 0;
    background: linear-gradient(180deg, #ffffff 0%, #e0e0e0 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 
      0 2px 4px rgba(0, 0, 0, 0.3),
      0 1px 0 rgba(255, 255, 255, 0.1);
    position: relative;
  }

  .recents-title::after {
    content: 'Recents';
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    font-size: 2.5rem;
    font-weight: 700;
    background: linear-gradient(180deg, #ffffff 0%, #e0e0e0 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    transform: rotatex(180deg) translatey(15px);
    transform-origin: top;
    mask-image: linear-gradient(transparent 30%, rgba(255, 255, 255, 0.1) 60%, rgba(255, 255, 255, 0.3) 90%);
    -webkit-mask-image: linear-gradient(transparent 30%, rgba(255, 255, 255, 0.1) 60%, rgba(255, 255, 255, 0.3) 90%);
    filter: blur(1px) brightness(1.2);
    opacity: 0.4;
    z-index: -1;
  }

  .documents-list {
    flex: 1;
    padding: 1rem;
  }

  .document-item {
    width: 100%;
    background: linear-gradient(180deg, #2a2a3e 0%, #1f1f2e 100%);
    border: 1px solid #3a3a4e;
    border-radius: 8px;
    padding: 0.375rem;
    margin-bottom: 0.25rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 
      0 1px 3px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .document-item:hover {
    background: linear-gradient(180deg, #323347 0%, #2a2a3e 100%);
    border-color: #8a7cc7;
    transform: translateX(4px);
    box-shadow: 
      0 2px 8px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }

  .document-info {
    flex: 1;
    text-align: left;
  }

  .document-title {
    font-size: 0.85rem;
    font-weight: 600;
    color: #e0e0e0;
    margin: 0 0 0.125rem 0;
    line-height: 1.2;
  }

  .document-preview {
    font-size: 0.75rem;
    color: #a0a0a0;
    line-height: 1.3;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .document-arrow {
    color: #6a6a7e;
    font-size: 0.85rem;
    transition: all 0.2s ease;
    margin-left: 0.5rem;
    font-weight: 300;
    text-shadow: 
      0 1px 0 rgba(255, 255, 255, 0.1),
      0 -1px 0 rgba(0, 0, 0, 0.3);
  }

  .document-item:hover .document-arrow {
    color: #8a7cc7;
    transform: translateX(4px);
    text-shadow: 
      0 1px 0 rgba(255, 255, 255, 0.2),
      0 -1px 0 rgba(0, 0, 0, 0.4);
  }

  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: #a0a0a0;
  }

  .empty-state p {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
  }

  .create-first-btn {
    padding: 0.75rem 1.5rem;
    background: #8a7cc7;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.2s ease;
  }

  .create-first-btn:hover {
    background: #7a6bb7;
  }

  @media (max-width: 768px) {
    .content-wrapper {
      padding: 1rem;
    }
    
    .recents-title {
      font-size: 2rem;
    }
  }
</style>
