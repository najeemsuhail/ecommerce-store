'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faX } from '@fortawesome/free-solid-svg-icons';

interface FacetFilters {
  brands: string[];
  categories: string[];
  priceRange: {
    min: number;
    max: number;
  };
  isDigital?: boolean;
  isFeatured?: boolean;
}

interface FacetData {
  brands: { name: string; count: number }[];
  categories: { name: string; count: number }[];
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
  });

  const [priceInput, setPriceInput] = useState({
    min: selectedFilters.priceRange.min,
    max: selectedFilters.priceRange.max,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleBrandChange = (brand: string) => {
    const newBrands = selectedFilters.brands.includes(brand)
      ? selectedFilters.brands.filter((b) => b !== brand)
      : [...selectedFilters.brands, brand];
    onFilterChange({ ...selectedFilters, brands: newBrands });
  };

  const handleCategoryChange = (category: string) => {
    const newCategories = selectedFilters.categories.includes(category)
      ? selectedFilters.categories.filter((c) => c !== category)
      : [...selectedFilters.categories, category];
    onFilterChange({ ...selectedFilters, categories: newCategories });
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
            {facets.categories.map((category) => (
              <label key={category.name} className="flex items-center gap-3 cursor-pointer hover:text-primary-theme">
                <input
                  type="checkbox"
                  checked={selectedFilters.categories.includes(category.name)}
                  onChange={() => handleCategoryChange(category.name)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-gray-700">{category.name}</span>
                <span className="text-gray-500 text-sm">({category.count})</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Brands */}
      <div className="mb-6 border-b pb-6">
        <button
          onClick={() => toggleSection('brands')}
          className="w-full flex items-center justify-between font-semibold text-gray-theme hover:text-primary-theme transition-colors"
        >
          <span>Brands</span>
          <FontAwesomeIcon
            icon={expandedSections.brands ? faChevronUp : faChevronDown}
            className="w-4 h-4"
          />
        </button>
        {expandedSections.brands && (
          <div className="mt-4 space-y-3">
            {facets.brands.map((brand) => (
              <label key={brand.name} className="flex items-center gap-3 cursor-pointer hover:text-primary-theme">
                <input
                  type="checkbox"
                  checked={selectedFilters.brands.includes(brand.name)}
                  onChange={() => handleBrandChange(brand.name)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-gray-700">{brand.name}</span>
                <span className="text-gray-500 text-sm">({brand.count})</span>
              </label>
            ))}
          </div>
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
                  placeholder="₹0"
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
                  placeholder={`₹${facets.priceRange.max}`}
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

      {/* Product Type */}
      <div className="mb-6 border-b pb-6">
        <button
          onClick={() => toggleSection('type')}
          className="w-full flex items-center justify-between font-semibold text-gray-theme hover:text-primary-theme transition-colors"
        >
          <span>Product Type</span>
          <FontAwesomeIcon
            icon={expandedSections.type ? faChevronUp : faChevronDown}
            className="w-4 h-4"
          />
        </button>
        {expandedSections.type && (
          <div className="mt-4 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer hover:text-blue-600">
              <input
                type="checkbox"
                checked={selectedFilters.isDigital === true}
                onChange={handleDigitalChange}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-gray-700">Digital Products</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer hover:text-blue-600">
              <input
                type="checkbox"
                checked={selectedFilters.isFeatured === true}
                onChange={handleFeaturedChange}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-gray-700">Featured Only</span>
            </label>
          </div>
        )}
      </div>

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
            {selectedFilters.categories.map((category) => (
              <div
                key={category}
                className="flex items-center justify-between bg-primary-light text-primary-theme px-3 py-1 rounded-full text-sm"
              >
                <span>Category: {category}</span>
                <button
                  onClick={() => handleCategoryChange(category)}
                  className="hover:text-blue-900 ml-2"
                >
                  <FontAwesomeIcon icon={faX} className="w-3 h-3" />
                </button>
              </div>
            ))}
            {(selectedFilters.priceRange.min > 0 || selectedFilters.priceRange.max < facets.priceRange.max) && (
              <div className="flex items-center justify-between bg-primary-light text-primary-theme px-3 py-1 rounded-full text-sm">
                <span>
                  Price: ₹{selectedFilters.priceRange.min} - ₹{selectedFilters.priceRange.max}
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
