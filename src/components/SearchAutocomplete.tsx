'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFolder, faTag, faBox } from '@fortawesome/free-solid-svg-icons';
import { formatPrice } from '@/lib/currency';

interface ProductSuggestion {
  type: 'product';
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  brand?: string;
}

interface CategorySuggestion {
  type: 'category';
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

interface TagSuggestion {
  type: 'tag';
  name: string;
}

type Suggestion = ProductSuggestion | CategorySuggestion | TagSuggestion;

interface SearchResults {
  products: ProductSuggestion[];
  categories: CategorySuggestion[];
  tags: TagSuggestion[];
  totalResults: number;
}

export default function SearchAutocomplete() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({ 
    products: [], 
    categories: [], 
    tags: [], 
    totalResults: 0 
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Flatten all suggestions for keyboard navigation
  const allSuggestions: Suggestion[] = [
    ...results.categories,
    ...results.products,
    ...results.tags,
  ];

  // Fetch autocomplete suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 1) {
        setResults({ products: [], categories: [], tags: [], totalResults: 0 });
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/products/autocomplete?q=${encodeURIComponent(query)}&limit=10`);
        const data = await response.json();
        if (data.success) {
          setResults({
            products: data.products || [],
            categories: data.categories || [],
            tags: data.tags || [],
            totalResults: data.totalResults || 0,
          });
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
    if (!isOpen || allSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < allSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectSuggestion(allSuggestions[selectedIndex]);
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
      const selectedElement = suggestionsRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      (selectedElement as HTMLElement)?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    if (suggestion.type === 'product') {
      router.push(`/products/${suggestion.slug}`);
    } else if (suggestion.type === 'category') {
      router.push(`/products?category=${encodeURIComponent(suggestion.name)}`);
    } else if (suggestion.type === 'tag') {
      router.push(`/products?tag=${encodeURIComponent(suggestion.name)}`);
    }
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
            placeholder="Search products, categories..."
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
        {isOpen && (results.totalResults > 0 || isLoading) && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-1 bg-light-theme border border-border-color rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          >
            {isLoading ? (
              <div className="px-4 py-3 text-center text-text-lighter text-sm">
                Loading suggestions...
              </div>
            ) : (
              <>
                {/* Categories */}
                {results.categories.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold text-text-light uppercase bg-bg-gray">
                      Categories
                    </div>
                    {results.categories.map((category, index) => {
                      const globalIndex = index;
                      return (
                        <button
                          key={category.id}
                          data-index={globalIndex}
                          onClick={() => handleSelectSuggestion(category)}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors border-b ${
                            globalIndex === selectedIndex
                              ? 'bg-primary/10'
                              : 'hover:bg-bg-gray'
                          }`}
                        >
                          <FontAwesomeIcon
                            icon={faFolder}
                            className="w-4 h-4 text-primary flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-text-dark text-sm truncate">
                              {category.name}
                            </div>
                            <div className="text-xs text-text-light">
                              {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Products */}
                {results.products.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold text-text-light uppercase bg-bg-gray">
                      Products
                    </div>
                    {results.products.map((product, index) => {
                      const globalIndex = results.categories.length + index;
                      return (
                        <button
                          key={product.id}
                          data-index={globalIndex}
                          onClick={() => handleSelectSuggestion(product)}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors border-b ${
                            globalIndex === selectedIndex
                              ? 'bg-primary/10'
                              : 'hover:bg-bg-gray'
                          }`}
                        >
                          {/* Product Image */}
                          {product.image ? (
                            <div className="w-10 h-10 flex-shrink-0 bg-bg-gray rounded overflow-hidden">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 flex-shrink-0 bg-bg-gray rounded flex items-center justify-center">
                              <FontAwesomeIcon icon={faBox} className="w-4 h-4 text-text-lighter" />
                            </div>
                          )}

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-text-dark text-sm truncate">
                              {product.name}
                            </div>
                            {product.brand && (
                              <div className="text-xs text-text-light">
                                {product.brand}
                              </div>
                            )}
                          </div>

                          {/* Price */}
                          <div className="flex-shrink-0 font-semibold text-text-dark text-sm">
                            {formatPrice(product.price)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Tags */}
                {results.tags.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold text-text-light uppercase bg-bg-gray">
                      Tags
                    </div>
                    {results.tags.map((tag, index) => {
                      const globalIndex = results.categories.length + results.products.length + index;
                      return (
                        <button
                          key={tag.name}
                          data-index={globalIndex}
                          onClick={() => handleSelectSuggestion(tag)}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors border-b last:border-b-0 ${
                            globalIndex === selectedIndex
                              ? 'bg-primary/10'
                              : 'hover:bg-bg-gray'
                          }`}
                        >
                          <FontAwesomeIcon
                            icon={faTag}
                            className="w-4 h-4 text-secondary flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-text-dark text-sm truncate">
                              {tag.name}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* View All Results */}
                <button
                  onClick={handleSearch}
                  className="w-full px-4 py-2 text-center text-primary-theme hover:bg-primary-light font-medium text-sm border-t"
                >
                  View all results for "{query}"
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
