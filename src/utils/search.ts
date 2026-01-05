interface SearchIndexEntry {
  id: string;
  title: string;
  url: string;
  content: string;
  preview: string;
}

class SearchManager {
  private documents: SearchIndexEntry[] = [];
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    try {
      const baseUrl = typeof window !== 'undefined' && (window as any).__DOCUSAURUS_BASEURL__ 
        ? (window as any).__DOCUSAURUS_BASEURL__
        : '/site1000/';
      
      const response = await fetch(`${baseUrl}search-index.json`);
      const data = await response.json();
      
      if (data.documents && Array.isArray(data.documents)) {
        this.documents = data.documents.map((doc: any) => ({
          id: doc.id,
          title: doc.title.replace(/\r\n/g, ' '),
          url: doc.url,
          content: doc.content.replace(/\r\n/g, ' '),
          preview: doc.preview.replace(/\r\n/g, ' '),
        }));
        console.log('Loaded', this.documents.length, 'documents');
      }
      
      this.initialized = true;
    } catch (error) {
      console.warn('Could not initialize search:', error);
      this.initialized = true;
    }
  }

  search(query: string): SearchIndexEntry[] {
    if (!query.trim() || this.documents.length === 0) return [];

    const queryLower = query.toLowerCase();
    const results: SearchIndexEntry[] = [];
    const scored: Array<[SearchIndexEntry, number]> = [];

    for (const doc of this.documents) {
      let score = 0;

      // Title match (highest priority)
      if (doc.title.toLowerCase().includes(queryLower)) {
        score += 100;
        // Exact word match in title gets bonus
        if (doc.title.toLowerCase().split(/\s+/).some(word => word.includes(queryLower))) {
          score += 50;
        }
      }

      // Content match
      if (doc.content.toLowerCase().includes(queryLower)) {
        score += 10;
      }

      // Preview match
      if (doc.preview.toLowerCase().includes(queryLower)) {
        score += 5;
      }

      if (score > 0) {
        scored.push([doc, score]);
      }
    }

    // Sort by score and return top 10
    scored.sort((a, b) => b[1] - a[1]);
    
    return scored.slice(0, 10).map(([doc]) => doc);
  }
}

export const searchManager = new SearchManager();
