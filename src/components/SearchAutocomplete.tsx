'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBox } from '@fortawesome/free-solid-svg-icons';
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

export default function SearchAutocomplete({
  className = '',
  mobile = false,
  onNavigate,
}: {
  className?: string;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
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
  const [focusProducts, setFocusProducts] = useState<ProductSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
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

  // Load recent searches once
  useEffect(() => {
    try {
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.filter((item) => typeof item === 'string').slice(0, 6));
        }
      }
    } catch {
      setRecentSearches([]);
    }
  }, []);

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
    onNavigate?.();
  };

  const saveRecentSearch = (term: string) => {
    const normalized = term.trim();
    if (!normalized) return;

    const updated = [normalized, ...recentSearches.filter((item) => item.toLowerCase() !== normalized.toLowerCase())].slice(0, 6);
    setRecentSearches(updated);
    try {
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    } catch {
      // Ignore localStorage write errors
    }
  };

  const fetchFocusSuggestions = async () => {
    if (focusProducts.length > 0) {
      setIsOpen(true);
      return;
    }

    try {
      const response = await fetch('/api/products?isFeatured=true&limit=6');
      const data = await response.json();
      if (data.success && Array.isArray(data.products)) {
        setFocusProducts(
          data.products.map((product: any) => ({
            type: 'product' as const,
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            image: product.images?.[0] || null,
            brand: product.brand || undefined,
          }))
        );
      }
    } catch {
      setFocusProducts([]);
    } finally {
      setIsOpen(true);
    }
  };

  const handleQuickSearch = (term: string) => {
    if (!term.trim()) return;
    saveRecentSearch(term);
    router.push(`/products?search=${encodeURIComponent(term)}`);
    setIsOpen(false);
    setQuery('');
    onNavigate?.();
  };

  const handleSearch = () => {
    if (query.trim()) {
      saveRecentSearch(query);
      router.push(`/products?search=${encodeURIComponent(query)}`);
      setIsOpen(false);
      setQuery('');
      onNavigate?.();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex-1 ${mobile ? 'max-w-none mx-0' : 'max-w-3xl mx-4 md:max-w-5xl lg:max-w-6xl md:mx-8'} ${className}`}
    >
      <div className="relative w-full">
        {/* Search Input */}
        <div className="relative w-full flex items-center bg-white rounded-full border border-border-color hover:border-primary hover:shadow-md transition-all">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-lighter w-4 h-4"
          />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (query.trim()) {
                setIsOpen(true);
              } else {
                fetchFocusSuggestions();
              }
            }}
            className={`flex-1 w-full px-4 py-2.5 pl-12 ${mobile ? 'pr-20' : 'pr-10'} rounded-full bg-transparent focus:outline-none text-sm`}
          />
          {mobile && (
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-semibold rounded-full bg-primary text-white hover:bg-primary-dark transition-colors"
              title="Search"
            >
              Search
            </button>
          )}
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setIsOpen(false);
              }}
              className={`text-text-lighter hover:text-text-dark transition-colors ${mobile ? 'absolute right-[72px] top-1/2 -translate-y-1/2 px-2' : 'px-3'}`}
              title="Clear search"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>

        {/* Autocomplete Dropdown */}
        {isOpen && (query || results.totalResults > 0 || focusProducts.length > 0 || recentSearches.length > 0) && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-border-color rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto"
          >
            {isLoading ? (
              <div className="px-4 py-6 text-center text-text-lighter text-sm">
                <svg className="inline animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Searching...
              </div>
            ) : (
              <>
                {!query && (
                  <>
                    {recentSearches.length > 0 && (
                      <div className="border-b border-border-color">
                        <div className="px-4 py-2.5 text-xs font-bold text-text-lighter uppercase bg-bg-light rounded-t-2xl">
                          Recent Searches
                        </div>
                        <div className="px-4 py-3 flex flex-wrap gap-2">
                          {recentSearches.map((term) => (
                            <button
                              key={term}
                              onClick={() => handleQuickSearch(term)}
                              className="px-3 py-1.5 bg-bg-light text-text-dark text-xs rounded-full hover:bg-bg-gray transition-colors border border-border-color"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {focusProducts.length > 0 && (
                      <div className="border-b border-border-color last:border-b-0">
                        <div className="sticky top-0 px-4 py-2.5 text-xs font-bold text-text-lighter uppercase bg-bg-light flex items-center gap-2">
                          Popular Products
                        </div>
                        {focusProducts.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => handleSelectSuggestion(product)}
                            className="w-full px-4 py-3 flex gap-3 text-left transition-colors border-b border-border-color last:border-b-0 hover:bg-blue-50"
                          >
                            {product.image ? (
                              <div className="w-12 h-12 flex-shrink-0 bg-bg-gray rounded-lg overflow-hidden">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 flex-shrink-0 bg-bg-gray rounded-lg flex items-center justify-center">
                                <FontAwesomeIcon icon={faBox} className="w-4 h-4 text-text-lighter" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-text-dark text-sm line-clamp-2">{product.name}</div>
                              {product.brand && (
                                <div className="text-xs text-text-lighter mt-1">{product.brand}</div>
                              )}
                              <div className="text-sm font-bold text-primary mt-1">{formatPrice(product.price)}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* Search All Results - Top */}
                {query && (results.products.length > 0 || results.categories.length > 0 || results.tags.length > 0) && (
                  <div className="border-b border-border-color bg-bg-light">
                    <button
                      onClick={handleSearch}
                      className="w-full px-4 py-3 text-sm font-semibold text-primary hover:text-primary-dark transition-colors flex items-center justify-center gap-2"
                    >
                      <span>Search all results for "{query}"</span>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 10l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Products */}
                {results.products.length > 0 && (
                  <div className="border-b border-border-color last:border-b-0">
                    <div className="sticky top-0 px-4 py-2.5 text-xs font-bold text-text-lighter uppercase bg-bg-light rounded-t-2xl flex items-center gap-2">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 6H6.28l-.31-1.243A1 1 0 005 4H3z" />
                      </svg>
                      Products
                    </div>
                    {results.products.map((product, index) => {
                      const globalIndex = index;
                      return (
                        <button
                          key={product.id}
                          data-index={globalIndex}
                          onClick={() => handleSelectSuggestion(product)}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          className={`w-full px-4 py-3 flex gap-3 text-left transition-colors border-b border-border-color last:border-b-0 ${
                            globalIndex === selectedIndex ? 'bg-blue-50' : 'hover:bg-blue-50'
                          }`}
                        >
                          {/* Product Image */}
                          {product.image ? (
                            <div className="w-12 h-12 flex-shrink-0 bg-bg-gray rounded-lg overflow-hidden">
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
                            <div className="w-12 h-12 flex-shrink-0 bg-bg-gray rounded-lg flex items-center justify-center">
                              <FontAwesomeIcon icon={faBox} className="w-4 h-4 text-text-lighter" />
                            </div>
                          )}

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-text-dark text-sm line-clamp-2">{product.name}</div>
                            {product.brand && (
                              <div className="text-xs text-text-lighter mt-1">{product.brand}</div>
                            )}
                            <div className="text-sm font-bold text-primary mt-1">{formatPrice(product.price)}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Categories */}
                {results.categories.length > 0 && (
                  <div className="border-b border-border-color last:border-b-0">
                    <div className="sticky top-0 px-4 py-2.5 text-xs font-bold text-text-lighter uppercase bg-bg-light flex items-center gap-2">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M7 3a1 1 0 000 2h6a1 1 0 000-2H7zM4 7a1 1 0 011-1h10a1 1 0 011 1v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7z" />
                      </svg>
                      Categories
                    </div>
                    {results.categories.map((category, index) => {
                      const globalIndex = results.products.length + index;
                      return (
                        <button
                          key={category.id}
                          data-index={globalIndex}
                          onClick={() => handleSelectSuggestion(category)}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          className={`w-full px-4 py-3 flex justify-between items-center text-left transition-colors border-b border-border-color last:border-b-0 ${
                            globalIndex === selectedIndex ? 'bg-purple-50' : 'hover:bg-purple-50'
                          }`}
                        >
                          <span className="font-semibold text-text-dark text-sm">{category.name}</span>
                          <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-medium flex-shrink-0">
                            {category.productCount}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Tags */}
                {results.tags.length > 0 && (
                  <div className="border-b border-border-color last:border-b-0">
                    <div className="sticky top-0 px-4 py-2.5 text-xs font-bold text-text-lighter uppercase bg-bg-light flex items-center gap-2">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.5 2a1.5 1.5 0 00-1.5 1.5v3H2a1 1 0 000 2h1v2H2a1 1 0 000 2h1v3a1.5 1.5 0 001.5 1.5h3v1a1 1 0 002 0v-1h2v1a1 1 0 002 0v-1h3a1.5 1.5 0 001.5-1.5v-3h1a1 1 0 000-2h-1v-2h1a1 1 0 000-2h-1v-3A1.5 1.5 0 0014.5 2h-9zm0 2h9v9h-9V4z" clipRule="evenodd" />
                      </svg>
                      Trending Tags
                    </div>
                    <div className="px-4 py-3 flex flex-wrap gap-2">
                      {results.tags.map((tag) => (
                        <button
                          key={tag.name}
                          onClick={() => handleSelectSuggestion(tag)}
                          className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 text-text-dark text-xs rounded-full hover:from-blue-100 hover:to-purple-100 hover:text-primary transition-colors font-medium border border-border-color"
                        >
                          #{tag.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Results */}
                {query && results.products.length === 0 && results.categories.length === 0 && results.tags.length === 0 && (
                  <div className="px-4 py-8 text-center">
                    <svg className="mx-auto w-12 h-12 text-text-lighter mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-sm text-text-lighter font-medium">No results for "{query}"</p>
                    <button
                      onClick={handleSearch}
                      className="mt-3 text-xs text-primary hover:text-primary-dark font-semibold"
                    >
                      Search all products →
                    </button>
                  </div>
                )}

              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
