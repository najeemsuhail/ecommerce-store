'use client';

import { useEffect, useState } from 'react';
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

  useEffect(() => {
    fetchAttributes();
  }, [categoryIds]);

  const fetchAttributes = async () => {
    try {
      setLoading(true);
      const allAttributes: Attribute[] = [];

      if (categoryIds.length > 0) {
        // Fetch attributes for selected categories
        for (const categoryId of categoryIds) {
          const res = await fetch(`/api/admin/attributes?categoryId=${categoryId}`);
          if (!res.ok) continue;
          const data = await res.json();
          allAttributes.push(...data.filter((a: any) => a.filterable));
        }
      } else {
        // Fetch all filterable attributes for all categories
        const res = await fetch(`/api/admin/attributes`);
        if (res.ok) {
          const data = await res.json();
          allAttributes.push(...data.filter((a: any) => a.filterable));
        }
      }

      // Remove duplicates and filter for filterable only
      const uniqueAttrs = Array.from(
        new Map(allAttributes.map(a => [a.id, a])).values()
      );

      setAttributes(uniqueAttrs);
      setExpandedAttrs(new Set(uniqueAttrs.map(a => a.id)));
    } catch (err) {
      console.error('Failed to load attributes:', err);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading || attributes.length === 0) {
    return null;
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
