'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { formatPrice } from '@/lib/currency';

interface Suggestion {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  brand?: string;
  category?: string;
}

export default function SearchAutocomplete() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch autocomplete suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 1) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/products/autocomplete?q=${encodeURIComponent(query)}&limit=8`);
        const data = await response.json();
        if (data.success) {
          setSuggestions(data.suggestions);
          setIsOpen(true);
          setSelectedIndex(-1);
        }
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300); // Debounce
    return () => clearTimeout(timer);
  }, [query]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        } else if (query.trim()) {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedIndex] as HTMLElement;
      selectedElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    router.push(`/products/${suggestion.slug}`);
    setIsOpen(false);
    setQuery('');
  };

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="hidden md:block relative flex-1 max-w-md">
      <div className="relative">
        {/* Search Input */}
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query && setIsOpen(true)}
            className="w-full px-4 py-2 pl-10 rounded-lg border border-border-color focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
          />
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-lighter w-4 h-4"
          />
        </div>

        {/* Autocomplete Dropdown */}
        {isOpen && (suggestions.length > 0 || isLoading) && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-1 bg-light-theme border border-border-color rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          >
            {isLoading ? (
              <div className="px-4 py-3 text-center text-text-lighter text-sm">
                Loading suggestions...
              </div>
            ) : suggestions.length > 0 ? (
              <>
                {/* Product Suggestions */}
                <div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors border-b last:border-b-0 ${
                        index === selectedIndex
                          ? 'bg-primary/10'
                          : 'hover:bg-bg-gray'
                      }`}
                    >
                      {/* Product Image */}
                      {suggestion.image && (
                        <div className="w-10 h-10 flex-shrink-0 bg-bg-gray rounded overflow-hidden">
                          <img
                            src={suggestion.image}
                            alt={suggestion.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-text-dark text-sm truncate">
                          {suggestion.name}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-text-light">
                          {suggestion.brand && <span>{suggestion.brand}</span>}
                          {suggestion.category && (
                            <>
                              <span>•</span>
                              <span>{suggestion.category}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex-shrink-0 font-semibold text-text-dark text-sm">
                        {formatPrice(suggestion.price)}
                      </div>
                    </button>
                  ))}
                </div>

                {/* View All Results */}
                {suggestions.length >= 8 && (
                  <button
                    onClick={handleSearch}
                    className="w-full px-4 py-2 text-center text-primary-theme hover:bg-primary-light font-medium text-sm border-t"
                  >
                    View all results for "{query}"
                  </button>
                )}
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
