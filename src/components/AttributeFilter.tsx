'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface Attribute {
  id: string;
  name: string;
  type: string;
  options: string[];
  filterable: boolean;
}

interface AttributeFilterProps {
  categoryIds: string[];
  selectedFilters: { [key: string]: string[] };
  onFilterChange: (filters: { [key: string]: string[] }) => void;
}

export default function AttributeFilter({
  categoryIds,
  selectedFilters,
  onFilterChange
}: AttributeFilterProps) {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAttrs, setExpandedAttrs] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string>('');

  useEffect(() => {
    console.log('AttributeFilter: categoryIds changed', categoryIds);
    fetchAttributes();
  }, [categoryIds]);

  const fetchAttributes = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const allAttributes: Attribute[] = [];

      if (categoryIds.length > 0) {
        console.log('Fetching attributes for categories:', categoryIds);
        // Fetch attributes for selected categories
        for (const categoryId of categoryIds) {
          try {
            const url = `/api/admin/attributes?categoryId=${categoryId}`;
            console.log('Fetching:', url);
            const res = await fetch(url);
            if (!res.ok) {
              console.warn(`Failed to fetch attributes for category ${categoryId}: ${res.status}`);
              continue;
            }
            const data = await res.json();
            console.log(`Got ${data.length || 0} attributes for category ${categoryId}:`, data);
            if (Array.isArray(data)) {
              allAttributes.push(...data.filter((a: any) => a.filterable));
            }
          } catch (err) {
            console.warn(`Error fetching attributes for category ${categoryId}:`, err);
          }
        }
      } else {
        // Fetch all filterable attributes for all categories
        console.log('Fetching all attributes (no category filter)');
        try {
          const url = `/api/admin/attributes`;
          console.log('Fetching:', url);
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            console.log(`Got ${data.length || 0} all attributes:`, data);
            if (Array.isArray(data)) {
              allAttributes.push(...data.filter((a: any) => a.filterable));
            }
          } else {
            console.warn(`Failed to fetch all attributes: ${res.status}`);
            setError(`API error: ${res.status}`);
          }
        } catch (err) {
          console.warn('Error fetching all attributes:', err);
          setError(String(err));
        }
      }

      // Remove duplicates and filter for filterable only
      const uniqueAttrs = Array.from(
        new Map(allAttributes.map(a => [a.id, a])).values()
      );

      console.log('Final unique attributes after dedup:', uniqueAttrs);
      setAttributes(uniqueAttrs);
      setExpandedAttrs(new Set(uniqueAttrs.map(a => a.id)));
      if (uniqueAttrs.length > 0) {
        setError('');
      }
    } catch (err) {
      console.error('Failed to load attributes:', err);
      setError(`Exception: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  }, [categoryIds]);

  useEffect(() => {
    fetchAttributes();
  }, [fetchAttributes]);

  const toggleExpand = (attrId: string) => {
    const newExpanded = new Set(expandedAttrs);
    if (newExpanded.has(attrId)) {
      newExpanded.delete(attrId);
    } else {
      newExpanded.add(attrId);
    }
    setExpandedAttrs(newExpanded);
  };

  const handleFilterChange = (attributeId: string, value: string, checked: boolean) => {
    const newFilters = { ...selectedFilters };
    
    if (!newFilters[attributeId]) {
      newFilters[attributeId] = [];
    }

    if (checked) {
      newFilters[attributeId].push(value);
    } else {
      newFilters[attributeId] = newFilters[attributeId].filter(v => v !== value);
    }

    if (newFilters[attributeId].length === 0) {
      delete newFilters[attributeId];
    }

    onFilterChange(newFilters);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
        </div>
      </div>
    );
  }

  if (attributes.length === 0) {
    if (error) {
      return (
        <div className="space-y-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          <p>Error loading attributes: {error}</p>
        </div>
      );
    }
    // Show a placeholder when no attributes are found - helps with debugging
    return (
      <div className="space-y-4 p-3 bg-gray-50 border border-gray-200 rounded text-gray-500 text-sm">
        <p className="font-semibold">Attributes</p>
        <p className="text-xs">No attributes available for selected categories</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Attributes</h3>
      
      {attributes.map((attr) => (
        <div key={attr.id} className="border rounded-lg">
          <button
            onClick={() => toggleExpand(attr.id)}
            className="w-full flex items-center justify-between p-3 hover:bg-gray-50"
          >
            <span className="font-medium text-gray-700">{attr.name}</span>
            <span className="text-gray-500">
              {expandedAttrs.has(attr.id) ? '▼' : '▶'}
            </span>
          </button>

          {expandedAttrs.has(attr.id) && (
            <div className="px-3 pb-3 space-y-2 border-t">
              {attr.type === 'select' || attr.type === 'size' ? (
                attr.options.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFilters[attr.id]?.includes(opt) || false}
                      onChange={(e) => handleFilterChange(attr.id, opt, e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-gray-700">{opt}</span>
                  </label>
                ))
              ) : attr.type === 'color' ? (
                attr.options.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFilters[attr.id]?.includes(opt) || false}
                      onChange={(e) => handleFilterChange(attr.id, opt, e.target.checked)}
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
                ))
              ) : null}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
