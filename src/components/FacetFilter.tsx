'use client';

import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faX } from '@fortawesome/free-solid-svg-icons';
import { formatPrice } from '@/lib/currency';

interface Attribute {
  id: string;
  name: string;
  type: string;
  options: string[];
  filterable: boolean;
}

interface FacetFilters {
  brands: string[];
  categories: string[];
  categoryIds: string[];
  priceRange: {
    min: number;
    max: number;
  };
  isDigital?: boolean;
  isFeatured?: boolean;
  attributes?: { [key: string]: string[] };
}

interface FacetData {
  brands: { name: string; count: number }[];
  categories: { name: string; id: string; count: number }[];
  priceRange: { min: number; max: number };
}

interface FacetFilterProps {
  facets: FacetData;
  selectedFilters: FacetFilters;
  onFilterChange: (filters: FacetFilters) => void;
}

export default function FacetFilter({ facets, selectedFilters, onFilterChange }: FacetFilterProps) {
  const [expandedSections, setExpandedSections] = useState({
    brands: true,
    categories: true,
    price: true,
    type: true,
    attributes: true,
  });
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [attributesLoading, setAttributesLoading] = useState(true);
  const [expandedAttrs, setExpandedAttrs] = useState<Set<string>>(new Set());

  const [priceInput, setPriceInput] = useState({
    min: selectedFilters.priceRange?.min ?? 0,
    max: selectedFilters.priceRange?.max ?? 10000,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const fetchAttributes = useCallback(async () => {
    try {
      setAttributesLoading(true);
      const attributeMap = new Map<string, Attribute>(); // Use Map to deduplicate by ID

      if (selectedFilters.categoryIds.length > 0) {
        // Fetch attributes for selected categories
        for (const categoryId of selectedFilters.categoryIds) {
          try {
            const url = `/api/admin/attributes?categoryId=${categoryId}`;
            const res = await fetch(url);
            if (!res.ok) continue;
            const data = await res.json();
            if (Array.isArray(data)) {
              data
                .filter((a: any) => a.filterable)
                .forEach((attr: Attribute) => {
                  // Add by ID - prevents duplicates even from different categories
                  if (!attributeMap.has(attr.id)) {
                    attributeMap.set(attr.id, attr);
                  }
                });
            }
          } catch (err) {
            console.warn(`Error fetching attributes for category ${categoryId}:`, err);
          }
        }
      } else {
        // Fetch all filterable attributes for all categories
        try {
          const res = await fetch(`/api/admin/attributes`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              data
                .filter((a: any) => a.filterable)
                .forEach((attr: Attribute) => {
                  // Add by ID - prevents duplicates
                  if (!attributeMap.has(attr.id)) {
                    attributeMap.set(attr.id, attr);
                  }
                });
            }
          }
        } catch (err) {
          console.warn('Error fetching all attributes:', err);
        }
      }

      const uniqueAttrs = Array.from(attributeMap.values());
      
      setAttributes(uniqueAttrs);
      setExpandedAttrs(new Set(uniqueAttrs.map(a => a.id)));
    } catch (err) {
      console.error('Failed to load attributes:', err);
    } finally {
      setAttributesLoading(false);
    }
  }, [selectedFilters.categoryIds]);

  useEffect(() => {
    fetchAttributes();
  }, [fetchAttributes]);

  const handleBrandChange = (brand: string) => {
    const newBrands = selectedFilters.brands.includes(brand)
      ? selectedFilters.brands.filter((b) => b !== brand)
      : [...selectedFilters.brands, brand];
    onFilterChange({ ...selectedFilters, brands: newBrands, categoryIds: selectedFilters.categoryIds });
  };

  const handleCategoryChange = (category: string, categoryId: string) => {
    const newCategories = selectedFilters.categories.includes(category)
      ? selectedFilters.categories.filter((c) => c !== category)
      : [...selectedFilters.categories, category];
    
    const newCategoryIds = selectedFilters.categoryIds.includes(categoryId)
      ? selectedFilters.categoryIds.filter((c) => c !== categoryId)
      : [...selectedFilters.categoryIds, categoryId];
    
    onFilterChange({ 
      ...selectedFilters, 
      categories: newCategories,
      categoryIds: newCategoryIds,
    });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'min' | 'max') => {
    const value = parseFloat(e.target.value) || 0;
    const newPrice = { ...priceInput, [type]: value };
    setPriceInput(newPrice);
  };

  const applyPriceFilter = () => {
    onFilterChange({
      ...selectedFilters,
      priceRange: {
        min: Math.min(priceInput.min, priceInput.max),
        max: Math.max(priceInput.min, priceInput.max),
      },
    });
  };

  const handleDigitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...selectedFilters,
      isDigital: e.target.checked ? true : undefined,
    });
  };

  const handleFeaturedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...selectedFilters,
      isFeatured: e.target.checked ? true : undefined,
    });
  };

  const hasActiveFilters =
    selectedFilters.brands.length > 0 ||
    selectedFilters.categories.length > 0 ||
    selectedFilters.isDigital ||
    selectedFilters.isFeatured ||
    selectedFilters.priceRange.min > 0 ||
    selectedFilters.priceRange.max < facets.priceRange.max;

  return (
    <div className="bg-light-theme rounded-lg shadow p-6 h-fit sticky top-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={() =>
              onFilterChange({
                brands: [],
                categories: [],
                categoryIds: [],
                priceRange: { min: 0, max: facets.priceRange.max },
                isDigital: undefined,
                isFeatured: undefined,
              })
            }
            className="text-xs text-danger-theme hover:text-danger-theme font-semibold"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Price Range */}
      <div className="mb-6 border-b pb-6">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between font-semibold text-gray-theme hover:text-primary-theme transition-colors"
        >
          <span>Price</span>
          <FontAwesomeIcon
            icon={expandedSections.price ? faChevronUp : faChevronDown}
            className="w-4 h-4"
          />
        </button>
        {expandedSections.price && (
          <div className="mt-4 space-y-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">Min</label>
                <input
                  type="number"
                  value={priceInput.min}
                  onChange={(e) => handlePriceChange(e, 'min')}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">Max</label>
                <input
                  type="number"
                  value={priceInput.max}
                  onChange={(e) => handlePriceChange(e, 'max')}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`${facets?.priceRange?.max ?? 50000}`}
                />
              </div>
            </div>
            <button
              onClick={applyPriceFilter}
              className="btn-filter-primary"
            >
              Apply Price
            </button>
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="mb-6 border-b pb-6">
        <button
          onClick={() => toggleSection('categories')}
          className="w-full flex items-center justify-between font-semibold text-gray-900 hover:text-blue-600 transition-colors"
        >
          <span>Categories</span>
          <FontAwesomeIcon
            icon={expandedSections.categories ? faChevronUp : faChevronDown}
            className="w-4 h-4"
          />
        </button>
        {expandedSections.categories && (
          <div className="mt-4 space-y-3">
            {facets?.categories && Array.isArray(facets.categories) ? (
              facets.categories.map((category) => (
                <label key={category.id} className="flex items-center gap-3 cursor-pointer hover:text-primary-theme">
                <input
                  type="checkbox"
                  checked={selectedFilters.categories.includes(category.name)}
                  onChange={() => handleCategoryChange(category.name, category.id)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-gray-700">{category.name}</span>
                <span className="text-gray-500 text-sm">({category.count})</span>
              </label>
            ))
            ) : null}
          </div>
        )}
      </div>

      {/* Attributes */}
      {attributes.length > 0 && (
        <div className="mb-6 border-b pb-6">
          <button
            onClick={() => toggleSection('attributes')}
            className="w-full flex items-center justify-between font-semibold text-gray-900 hover:text-blue-600 transition-colors"
          >
            <span>Attributes</span>
            <FontAwesomeIcon
              icon={expandedSections.attributes ? faChevronUp : faChevronDown}
              className="w-4 h-4"
            />
          </button>
          {expandedSections.attributes && (
            <div className="mt-4 space-y-4">
              {attributes.map((attr) => (
                <div key={attr.id}>
                  <p className="text-sm font-medium text-gray-700 mb-2">{attr.name}</p>
                  <div className="space-y-2">
                    {attr.type === 'select' || attr.type === 'size' ? (
                      attr.options && Array.isArray(attr.options) ? attr.options.map((opt) => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedFilters.attributes?.[attr.id]?.includes(opt) || false}
                            onChange={(e) => {
                              const newFilters = { ...selectedFilters.attributes || {} };
                              if (!newFilters[attr.id]) {
                                newFilters[attr.id] = [];
                              }
                              if (e.target.checked) {
                                newFilters[attr.id].push(opt);
                              } else {
                                newFilters[attr.id] = newFilters[attr.id].filter(v => v !== opt);
                              }
                              if (newFilters[attr.id].length === 0) {
                                delete newFilters[attr.id];
                              }
                              onFilterChange({
                                ...selectedFilters,
                                attributes: newFilters,
                              });
                            }}
                            className="w-4 h-4 rounded"
                          />
                          <span className="text-sm text-gray-700">{opt}</span>
                        </label>
                      )) : null
                    ) : attr.type === 'color' ? (
                      attr.options && Array.isArray(attr.options) ? attr.options.map((opt) => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedFilters.attributes?.[attr.id]?.includes(opt) || false}
                            onChange={(e) => {
                              const newFilters = { ...selectedFilters.attributes || {} };
                              if (!newFilters[attr.id]) {
                                newFilters[attr.id] = [];
                              }
                              if (e.target.checked) {
                                newFilters[attr.id].push(opt);
                              } else {
                                newFilters[attr.id] = newFilters[attr.id].filter(v => v !== opt);
                              }
                              if (newFilters[attr.id].length === 0) {
                                delete newFilters[attr.id];
                              }
                              onFilterChange({
                                ...selectedFilters,
                                attributes: newFilters,
                              });
                            }}
                            className="w-4 h-4 rounded"
                          />
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded border border-gray-300"
                              style={{ backgroundColor: opt }}
                            />
                            <span className="text-sm text-gray-700">{opt}</span>
                          </div>
                        </label>
                      )) : null
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="pt-4 border-t">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Active Filters:</h3>
          <div className="space-y-2">
            {selectedFilters.brands.map((brand) => (
              <div
                key={brand}
                className="flex items-center justify-between bg-primary-light text-primary-theme px-3 py-1 rounded-full text-sm"
              >
                <span>Brand: {brand}</span>
                <button
                  onClick={() => handleBrandChange(brand)}
                  className="hover:text-blue-900 ml-2"
                >
                  <FontAwesomeIcon icon={faX} className="w-3 h-3" />
                </button>
              </div>
            ))}
            {selectedFilters.categories.map((category) => {
              // Find the category ID from facets
              const categoryObj = facets?.categories?.find((c) => c.name === category);
              const categoryId = categoryObj?.id || '';
              
              return (
                <div
                  key={category}
                  className="flex items-center justify-between bg-primary-light text-primary-theme px-3 py-1 rounded-full text-sm"
                >
                  <span>Category: {category}</span>
                  <button
                    onClick={() => handleCategoryChange(category, categoryId)}
                    className="hover:text-blue-900 ml-2"
                  >
                    <FontAwesomeIcon icon={faX} className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
            {(selectedFilters.priceRange.min > 0 || selectedFilters.priceRange.max < facets.priceRange.max) && (
              <div className="flex items-center justify-between bg-primary-light text-primary-theme px-3 py-1 rounded-full text-sm">
                <span>
                  Price: {formatPrice(selectedFilters.priceRange.min)} - {formatPrice(selectedFilters.priceRange.max)}
                </span>
                <button
                  onClick={() =>
                    onFilterChange({
                      ...selectedFilters,
                      priceRange: { min: 0, max: facets.priceRange.max },
                    })
                  }
                  className="hover:text-primary-dark ml-2"
                >
                  <FontAwesomeIcon icon={faX} className="w-3 h-3" />
                </button>
              </div>
            )}
            {selectedFilters.isDigital && (
              <div className="flex items-center justify-between bg-primary-light text-primary-theme px-3 py-1 rounded-full text-sm">
                <span>Digital Products</span>
                <button
                  onClick={() =>
                    onFilterChange({
                      ...selectedFilters,
                      isDigital: undefined,
                    })
                  }
                  className="hover:text-primary-dark ml-2"
                >
                  <FontAwesomeIcon icon={faX} className="w-3 h-3" />
                </button>
              </div>
            )}
            {selectedFilters.isFeatured && (
              <div className="flex items-center justify-between bg-primary-light text-primary-theme px-3 py-1 rounded-full text-sm">
                <span>Featured Only</span>
                <button
                  onClick={() =>
                    onFilterChange({
                      ...selectedFilters,
                      isFeatured: undefined,
                    })
                  }
                  className="hover:text-primary-dark ml-2"
                >
                  <FontAwesomeIcon icon={faX} className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
