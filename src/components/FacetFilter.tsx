'use client';

import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faX } from '@fortawesome/free-solid-svg-icons';
import { formatPrice } from '@/lib/currency';

interface Attribute {
  id: string;
  name: string;
  type: string;
  options: Array<{ value: string; count: number }>;
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
    attributes: false, // Start collapsed to prevent layout jumps when attributes load
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
      const attributeMap = new Map<string, Attribute>(); // Deduplicate by NAME

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
                  // Merge attributes with same name (from different categories)
                  if (!attributeMap.has(attr.name)) {
                    attributeMap.set(attr.name, {
                      id: attr.id,
                      name: attr.name,
                      type: attr.type,
                      options: (attr.options || []).map(opt => ({ value: typeof opt === 'string' ? opt : opt.value, count: 0 })),
                      filterable: attr.filterable,
                    });
                  } else {
                    // Merge options from duplicate attributes
                    const existing = attributeMap.get(attr.name)!;
                    const existingOptions = new Set(existing.options.map(o => o.value));
                    (attr.options || []).forEach(opt => {
                      const optValue = typeof opt === 'string' ? opt : opt.value;
                      if (!existingOptions.has(optValue)) {
                        existing.options.push({ value: optValue, count: 0 });
                        existingOptions.add(optValue);
                      }
                    });
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
                  // Merge attributes with same name
                  if (!attributeMap.has(attr.name)) {
                    attributeMap.set(attr.name, {
                      id: attr.id,
                      name: attr.name,
                      type: attr.type,
                      options: (attr.options || []).map(opt => ({ value: typeof opt === 'string' ? opt : opt.value, count: 0 })),
                      filterable: attr.filterable,
                    });
                  } else {
                    // Merge options from duplicate attributes
                    const existing = attributeMap.get(attr.name)!;
                    const existingOptions = new Set(existing.options.map(o => o.value));
                    (attr.options || []).forEach(opt => {
                      const optValue = typeof opt === 'string' ? opt : opt.value;
                      if (!existingOptions.has(optValue)) {
                        existing.options.push({ value: optValue, count: 0 });
                        existingOptions.add(optValue);
                      }
                    });
                  }
                });
            }
          }
        } catch (err) {
          console.warn('Error fetching all attributes:', err);
        }
      }

      // Fetch all products to calculate option counts
      try {
        const res = await fetch('/api/products?limit=10000');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.products)) {
            // Calculate counts for each attribute option
            attributeMap.forEach((attr) => {
              attr.options.forEach((opt) => {
                opt.count = data.products.filter((p: any) => {
                  if (p.attributeValues && Array.isArray(p.attributeValues)) {
                    return p.attributeValues.some((av: any) => 
                      av.attribute?.name === attr.name && av.value === opt.value
                    );
                  }
                  return false;
                }).length;
              });
            });
          }
        }
      } catch (err) {
        console.warn('Error fetching products for attribute counts:', err);
      }

      const uniqueAttrs = Array.from(attributeMap.values());
      setAttributes(uniqueAttrs);
      setExpandedAttrs(new Set()); // Don't auto-expand attributes when they load
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
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-xl p-5 h-fit sticky top-20 overflow-y-auto max-h-[calc(100vh-120px)]" style={{ contain: 'layout' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Filter & Refine</h2>
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
            className="text-xs px-3 py-1.5 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors font-semibold"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Price Range */}
      <div className="mb-4 border border-slate-200 rounded-xl p-4 bg-gradient-to-br from-slate-50 to-white">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between font-semibold text-slate-800 hover:text-blue-600 transition-colors"
        >
          <span className="tracking-tight">Price</span>
          <FontAwesomeIcon
            icon={expandedSections.price ? faChevronUp : faChevronDown}
            className="w-3.5 h-3.5 text-slate-500"
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
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  placeholder={`${facets?.priceRange?.max ?? 50000}`}
                />
              </div>
            </div>
            <button
              onClick={applyPriceFilter}
              className="w-full py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              Apply Price
            </button>
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="mb-4 border border-slate-200 rounded-xl p-4 bg-gradient-to-br from-slate-50 to-white">
        <button
          onClick={() => toggleSection('categories')}
          className="w-full flex items-center justify-between font-semibold text-slate-800 hover:text-blue-600 transition-colors"
        >
          <span className="tracking-tight">Categories</span>
          <FontAwesomeIcon
            icon={expandedSections.categories ? faChevronUp : faChevronDown}
            className="w-3.5 h-3.5 text-slate-500"
          />
        </button>
        {expandedSections.categories && (
          <div className="mt-4 space-y-3">
            {facets?.categories && Array.isArray(facets.categories) ? (
              facets.categories.map((category) => (
                <label key={category.id} className="flex items-center justify-between gap-3 cursor-pointer rounded-lg px-2 py-1.5 hover:bg-slate-100 transition-colors">
                <span className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedFilters.categories.includes(category.name)}
                  onChange={() => handleCategoryChange(category.name, category.id)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-700 text-sm font-medium">{category.name}</span>
                </span>
                <span className="text-slate-500 text-xs font-semibold bg-slate-100 px-2 py-0.5 rounded-full">{category.count}</span>
              </label>
            ))
            ) : null}
          </div>
        )}
      </div>

      {/* Attributes */}
      {attributes.length > 0 && (
        <div className="mb-4 border border-slate-200 rounded-xl p-4 bg-gradient-to-br from-slate-50 to-white">
          <button
            onClick={() => toggleSection('attributes')}
            className="w-full flex items-center justify-between font-semibold text-slate-800 hover:text-blue-600 transition-colors"
          >
            <span className="tracking-tight">Attributes</span>
            <FontAwesomeIcon
              icon={expandedSections.attributes ? faChevronUp : faChevronDown}
              className="w-3.5 h-3.5 text-slate-500"
            />
          </button>
          {expandedSections.attributes && (
            <div className="mt-4 space-y-4">
              {attributes.map((attr) => (
                <div key={attr.name}>
                  <p className="text-sm font-medium text-gray-700 mb-2">{attr.name}</p>
                  <div className="space-y-2">
                    {attr.type === 'select' || attr.type === 'size' ? (
                      attr.options && Array.isArray(attr.options) ? attr.options.map((opt) => (
                        <label key={opt.value} className="flex items-center justify-between gap-2 cursor-pointer rounded-lg px-2 py-1.5 hover:bg-slate-100 transition-colors">
                          <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedFilters.attributes?.[attr.id]?.includes(opt.value) || false}
                            onChange={(e) => {
                              const newFilters = { ...selectedFilters.attributes || {} };
                              if (!newFilters[attr.id]) {
                                newFilters[attr.id] = [];
                              }
                              if (e.target.checked) {
                                newFilters[attr.id].push(opt.value);
                              } else {
                                newFilters[attr.id] = newFilters[attr.id].filter(v => v !== opt.value);
                              }
                              if (newFilters[attr.id].length === 0) {
                                delete newFilters[attr.id];
                              }
                              onFilterChange({
                                ...selectedFilters,
                                attributes: newFilters,
                              });
                            }}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700">{opt.value}</span>
                          </span>
                          <span className="text-slate-500 text-xs font-semibold bg-slate-100 px-2 py-0.5 rounded-full">{opt.count}</span>
                        </label>
                      )) : null
                    ) : attr.type === 'color' ? (
                      attr.options && Array.isArray(attr.options) ? attr.options.map((opt) => (
                        <label key={opt.value} className="flex items-center justify-between gap-2 cursor-pointer rounded-lg px-2 py-1.5 hover:bg-slate-100 transition-colors">
                          <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedFilters.attributes?.[attr.id]?.includes(opt.value) || false}
                            onChange={(e) => {
                              const newFilters = { ...selectedFilters.attributes || {} };
                              if (!newFilters[attr.id]) {
                                newFilters[attr.id] = [];
                              }
                              if (e.target.checked) {
                                newFilters[attr.id].push(opt.value);
                              } else {
                                newFilters[attr.id] = newFilters[attr.id].filter(v => v !== opt.value);
                              }
                              if (newFilters[attr.id].length === 0) {
                                delete newFilters[attr.id];
                              }
                              onFilterChange({
                                ...selectedFilters,
                                attributes: newFilters,
                              });
                            }}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded border border-gray-300"
                              style={{ backgroundColor: opt.value }}
                            />
                            <span className="text-sm text-slate-700">{opt.value}</span>
                          </div>
                          </span>
                          <span className="text-slate-500 text-xs font-semibold bg-slate-100 px-2 py-0.5 rounded-full">{opt.count}</span>
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
        <div className="pt-4 border-t border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Active Filters</h3>
          <div className="space-y-2">
            {selectedFilters.brands.map((brand) => (
              <div
                key={brand}
                className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-3 py-1.5 rounded-full text-sm border border-blue-100"
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
                  className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-3 py-1.5 rounded-full text-sm border border-blue-100"
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
              <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-3 py-1.5 rounded-full text-sm border border-blue-100">
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
              <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-3 py-1.5 rounded-full text-sm border border-blue-100">
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
              <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-3 py-1.5 rounded-full text-sm border border-blue-100">
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
