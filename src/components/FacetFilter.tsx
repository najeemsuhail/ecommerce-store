'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faX } from '@fortawesome/free-solid-svg-icons';
import { formatPrice } from '@/lib/currency';

const normalizeCategoryKey = (value: string) => value.trim().toLowerCase();

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
  basePriceRange?: { min: number; max: number };
  categoryOptions?: { name: string; id: string; count?: number }[];
  categoryHierarchy?: { id: string; name: string; parentId?: string | null }[];
  selectedFilters: FacetFilters;
  onFilterChange: (filters: FacetFilters) => void;
}

export default function FacetFilter({
  facets,
  basePriceRange,
  categoryOptions,
  categoryHierarchy,
  selectedFilters,
  onFilterChange,
}: FacetFilterProps) {
  const resolvedBasePriceRange = basePriceRange ?? facets.priceRange;
  const defaultMinPrice = resolvedBasePriceRange.min > 0 ? resolvedBasePriceRange.min : 0;
  const formatPriceFilterLabel = (min: number, max: number) => {
    const hasMin = min > defaultMinPrice;
    const hasMax = max < resolvedBasePriceRange.max;

    if (hasMin && hasMax) {
      return `${formatPrice(min)} - ${formatPrice(max)}`;
    }

    if (hasMin) {
      return `${formatPrice(min)} and above`;
    }

    if (hasMax) {
      return `Up to ${formatPrice(max)}`;
    }

    return 'Any price';
  };

  const SHOW_ATTRIBUTES_SECTION = false; // Temporary toggle
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
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<string>>(new Set());

  const [priceInput, setPriceInput] = useState({
    min:
      selectedFilters.priceRange && selectedFilters.priceRange.min > defaultMinPrice
        ? String(selectedFilters.priceRange.min)
        : '',
    max:
      selectedFilters.priceRange && selectedFilters.priceRange.max < resolvedBasePriceRange.max
        ? String(selectedFilters.priceRange.max)
        : '',
  });
  const visibleAttributes = attributes.filter(
    (attr) => Array.isArray(attr.options) && attr.options.length > 0
  );

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const fetchAttributes = useCallback(async () => {
    if (!SHOW_ATTRIBUTES_SECTION) {
      setAttributes([]);
      setAttributesLoading(false);
      return;
    }

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
    const newPrice = { ...priceInput, [type]: e.target.value };
    setPriceInput(newPrice);
  };

  const applyPriceFilter = () => {
    const parsedMin = priceInput.min.trim() === '' ? defaultMinPrice : Number(priceInput.min);
    const parsedMax =
      priceInput.max.trim() === '' ? resolvedBasePriceRange.max : Number(priceInput.max);
    const normalizedMin = Number.isFinite(parsedMin) ? parsedMin : defaultMinPrice;
    const normalizedMax = Number.isFinite(parsedMax) ? parsedMax : resolvedBasePriceRange.max;

    onFilterChange({
      ...selectedFilters,
      priceRange: {
        min: Math.min(normalizedMin, normalizedMax),
        max: Math.max(normalizedMin, normalizedMax),
      },
    });
  };

  useEffect(() => {
    setPriceInput({
      min:
        selectedFilters.priceRange && selectedFilters.priceRange.min > defaultMinPrice
          ? String(selectedFilters.priceRange.min)
          : '',
      max:
        selectedFilters.priceRange && selectedFilters.priceRange.max < resolvedBasePriceRange.max
          ? String(selectedFilters.priceRange.max)
          : '',
    });
  }, [defaultMinPrice, resolvedBasePriceRange.max, selectedFilters.priceRange]);

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
    selectedFilters.priceRange.min > defaultMinPrice ||
    selectedFilters.priceRange.max < resolvedBasePriceRange.max;
  const visibleCategories = useMemo(() => {
    if (!categoryOptions || categoryOptions.length === 0) {
      return facets.categories;
    }

    const facetCountById = new Map(facets.categories.map((category) => [category.id, category.count]));

    return categoryOptions.map((category) => ({
      ...category,
      count: facetCountById.get(category.id) ?? category.count ?? 0,
    }));
  }, [categoryOptions, facets.categories]);
  const categorySourceCountById = useMemo(
    () => new Map(visibleCategories.map((category) => [category.id, category.count])),
    [visibleCategories]
  );
  const categoryIdByName = useMemo(() => {
    const map = new Map<string, string>();
    for (const category of [...visibleCategories, ...facets.categories]) {
      map.set(normalizeCategoryKey(category.name), category.id);
    }
    return map;
  }, [visibleCategories, facets.categories]);
  const hierarchyMap = useMemo(() => {
    const normalizedHierarchy =
      Array.isArray(categoryHierarchy) && categoryHierarchy.length > 0
        ? categoryHierarchy.map((category) => ({
            id: category.id,
            name: category.name,
            parentId: category.parentId ?? null,
          }))
        : [];

    if (normalizedHierarchy.length === 0) {
      return new Map(
        visibleCategories.map((category) => [
          category.id,
          {
            id: category.id,
            name: category.name,
            parentId: null,
          },
        ])
      );
    }

    const hierarchyEntries = new Map(
      normalizedHierarchy.map((category) => [category.id, category])
    );

    for (const category of visibleCategories) {
      if (!hierarchyEntries.has(category.id)) {
        hierarchyEntries.set(category.id, {
          id: category.id,
          name: category.name,
          parentId: null,
        });
      }
    }

    return hierarchyEntries;
  }, [categoryHierarchy, visibleCategories]);
  const childrenByParent = useMemo(() => {
    const map = new Map<string, Array<{ id: string; name: string; parentId: string | null }>>();
    for (const category of hierarchyMap.values()) {
      if (!category.parentId) continue;
      const existing = map.get(category.parentId) || [];
      existing.push(category);
      map.set(category.parentId, existing);
    }
    for (const children of map.values()) {
      children.sort((a, b) => a.name.localeCompare(b.name));
    }
    return map;
  }, [hierarchyMap]);
  const categoryCountById = useMemo(() => {
    const countById = new Map<string, number>();

    const computeCount = (categoryId: string): number => {
      if (countById.has(categoryId)) {
        return countById.get(categoryId)!;
      }

      let total = categorySourceCountById.get(categoryId) ?? 0;
      const children = childrenByParent.get(categoryId) || [];
      for (const child of children) {
        total += computeCount(child.id);
      }

      countById.set(categoryId, total);
      return total;
    };

    for (const categoryId of hierarchyMap.keys()) {
      computeCount(categoryId);
    }

    return countById;
  }, [categorySourceCountById, childrenByParent, hierarchyMap]);
  const rootCategories = useMemo(() => {
    const roots = Array.from(hierarchyMap.values()).filter((category) => !category.parentId);
    roots.sort((a, b) => a.name.localeCompare(b.name));
    return roots;
  }, [hierarchyMap]);

  const toggleCategoryExpand = (categoryId: string) => {
    setExpandedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  useEffect(() => {
    if (!selectedFilters.categoryIds.length) return;
    setExpandedCategoryIds((prev) => {
      const next = new Set(prev);
      for (const categoryId of selectedFilters.categoryIds) {
        let current = hierarchyMap.get(categoryId);
        while (current?.parentId) {
          next.add(current.parentId);
          current = hierarchyMap.get(current.parentId);
        }
      }
      return next;
    });
  }, [selectedFilters.categoryIds, hierarchyMap]);

  return (
    <div className="bg-light-theme rounded-lg shadow p-6 h-fit sticky top-20 overflow-y-auto max-h-[calc(100vh-120px)] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent" style={{ contain: 'layout' }}>
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
                priceRange: { min: defaultMinPrice, max: resolvedBasePriceRange.max },
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
                <label className="block text-xs text-gray-600 mb-1">Min price</label>
                <input
                  type="number"
                  value={priceInput.min}
                  onChange={(e) => handlePriceChange(e, 'min')}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={defaultMinPrice > 0 ? String(defaultMinPrice) : 'No minimum'}
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">Max price</label>
                <input
                  type="number"
                  value={priceInput.max}
                  onChange={(e) => handlePriceChange(e, 'max')}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={String(facets?.priceRange?.max ?? 50000)}
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
            {rootCategories.length > 0 ? (
              rootCategories.map((category) => {
                const children = childrenByParent.get(category.id) || [];
                const isExpanded = expandedCategoryIds.has(category.id);
                const count = categoryCountById.get(category.id) ?? 0;
                return (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label className="flex items-center gap-3 cursor-pointer hover:text-primary-theme min-w-0">
                        <input
                          type="checkbox"
                          checked={selectedFilters.categoryIds.includes(category.id)}
                          onChange={() => handleCategoryChange(category.name, category.id)}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <span className="text-gray-700 min-w-0 break-words">{category.name}</span>
                      </label>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                          {count}
                        </span>
                        {children.length > 0 && (
                          <button
                            type="button"
                            onClick={() => toggleCategoryExpand(category.id)}
                            className="text-gray-500 hover:text-gray-800"
                            aria-label={isExpanded ? 'Collapse subcategories' : 'Expand subcategories'}
                          >
                            <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {isExpanded && children.length > 0 && (
                      <div className="ml-6 space-y-2 border-l border-gray-200 pl-3">
                        {children.map((child) => (
                          <label key={child.id} className="flex items-center justify-between gap-3 cursor-pointer hover:text-primary-theme">
                            <span className="flex items-center gap-3 min-w-0">
                              <input
                                type="checkbox"
                                checked={selectedFilters.categoryIds.includes(child.id)}
                                onChange={() => handleCategoryChange(child.name, child.id)}
                                className="w-4 h-4 rounded border-gray-300"
                              />
                              <span className="text-gray-700 min-w-0 break-words">{child.name}</span>
                            </span>
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 flex-shrink-0">
                              {categoryCountById.get(child.id) ?? 0}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            ) : null}
          </div>
        )}
      </div>

      {/* Attributes */}
      {SHOW_ATTRIBUTES_SECTION && visibleAttributes.length > 0 && (
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
              {visibleAttributes.map((attr) => (
                <div key={attr.name}>
                  <p className="text-sm font-medium text-gray-700 mb-2">{attr.name}</p>
                  <div className="space-y-2">
                    {attr.type === 'select' || attr.type === 'size' || attr.type === 'text' || attr.type === 'number' || attr.type === 'multiselect' ? (
                      attr.options && Array.isArray(attr.options) ? attr.options.map((opt) => (
                        <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
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
                            className="w-4 h-4 rounded"
                          />
                          <span className="text-sm text-gray-700">{opt.value}</span>
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                            {opt.count}
                          </span>
                        </label>
                      )) : null
                    ) : attr.type === 'color' ? (
                      attr.options && Array.isArray(attr.options) ? attr.options.map((opt) => (
                        <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
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
                            className="w-4 h-4 rounded"
                          />
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded border border-gray-300"
                              style={{ backgroundColor: opt.value }}
                            />
                            <span className="text-sm text-gray-700">{opt.value}</span>
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                              {opt.count}
                            </span>
                          </div>
                        </label>
                      )) : null
                    ) : (
                      attr.options && Array.isArray(attr.options) ? attr.options.map((opt) => (
                        <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
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
                            className="w-4 h-4 rounded"
                          />
                          <span className="text-sm text-gray-700">{opt.value}</span>
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                            {opt.count}
                          </span>
                        </label>
                      )) : null
                    )}
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
              const categoryId = categoryIdByName.get(normalizeCategoryKey(category)) || '';
              
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
            {(selectedFilters.priceRange.min > defaultMinPrice ||
              selectedFilters.priceRange.max < resolvedBasePriceRange.max) && (
              <div className="flex items-center justify-between bg-primary-light text-primary-theme px-3 py-1 rounded-full text-sm">
                <span>
                  Price: {formatPriceFilterLabel(selectedFilters.priceRange.min, selectedFilters.priceRange.max)}
                </span>
                <button
                  onClick={() =>
                    onFilterChange({
                      ...selectedFilters,
                      priceRange: { min: defaultMinPrice, max: resolvedBasePriceRange.max },
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
