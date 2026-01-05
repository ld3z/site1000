import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import type { ReactNode } from 'react';
import { searchManager } from '../utils/search';
import './SearchBar.css';

interface SearchResult {
  id: string;
  title: string;
  url: string;
  preview: string;
}

export default function SearchBar(): ReactNode {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize search index on mount
  useEffect(() => {
    setIsLoading(true);
    searchManager.initialize().finally(() => {
      setIsLoading(false);
      console.log('Search index initialized');
    });
  }, []);

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Perform search with debounce
  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setHighlightedIndex(-1);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      const searchResults = searchManager.search(searchQuery);
      console.log('Search query:', searchQuery, 'Results:', searchResults.length);
      setResults(searchResults as SearchResult[]);
      setIsOpen(searchResults.length > 0);
    }, 150);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && results[highlightedIndex]) {
          window.location.href = results[highlightedIndex].url;
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setQuery('');
        setResults([]);
        break;
      default:
        break;
    }
  };

  return (
    <div ref={containerRef} className="search-bar-container">
      <div className="search-bar-input-wrapper">
        <svg
          className="search-bar-icon"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="7" cy="7" r="5" />
          <path d="m11 11 4 4" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          className="search-bar-input"
          placeholder="Search docs..."
          value={query}
          onInput={(e) => handleSearch((e.target as HTMLInputElement).value)}
          onFocus={() => query && results.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          aria-label="Search documentation"
        />
        {query && (
          <button
            className="search-bar-clear"
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="search-bar-results">
          <ul className="search-bar-results-list">
            {results.map((result, index) => (
              <li key={result.id}>
                <a
                  href={result.url}
                  className={`search-bar-result-item ${
                    index === highlightedIndex ? 'highlighted' : ''
                  }`}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <div className="search-bar-result-title">{result.title}</div>
                  <div className="search-bar-result-preview">
                    {result.preview}
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isOpen && query && results.length === 0 && !isLoading && (
        <div className="search-bar-no-results">
          No results found for "{query}"
        </div>
      )}
    </div>
  );
}
