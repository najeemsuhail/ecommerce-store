'use client';

import { useEffect, useState } from 'react';

interface Attribute {
  id: string;
  name: string;
  slug: string;
  type: string;
  required: boolean;
  options: string[];
}

interface ProductAttributeInputProps {
  categoryIds: string[];
  onAttributesChange: (attributes: { [key: string]: string }) => void;
  initialValues?: { [key: string]: string };
}

export default function ProductAttributeInput({
  categoryIds,
  onAttributesChange,
  initialValues = {}
}: ProductAttributeInputProps) {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState<{ [key: string]: string }>(initialValues);

  useEffect(() => {
    if (categoryIds.length === 0) {
      setAttributes([]);
      setLoading(false);
      return;
    }

    fetchAttributes();
  }, [categoryIds]);

  const fetchAttributes = async () => {
    try {
      setLoading(true);
      const allAttributes: Attribute[] = [];
      
      for (const categoryId of categoryIds) {
        const res = await fetch(`/api/admin/attributes?categoryId=${categoryId}`);
        if (!res.ok) continue;
        const data = await res.json();
        allAttributes.push(...data);
      }

      // Remove duplicates by slug
      const uniqueAttrs = Array.from(
        new Map(allAttributes.map(a => [a.slug, a])).values()
      );
      
      setAttributes(uniqueAttrs);
    } catch (err) {
      console.error('Failed to load attributes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (attributeId: string, value: string) => {
    const newValues = { ...values, [attributeId]: value };
    setValues(newValues);
    onAttributesChange(newValues);
  };

  if (loading) {
    return <div className="text-gray-500 text-sm">Loading attributes...</div>;
  }

  if (attributes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Product Attributes</h3>
      
      {attributes.map(attr => (
        <div key={attr.id}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {attr.name}
            {attr.required && <span className="text-red-500">*</span>}
          </label>

          {attr.type === 'text' && (
            <input
              type="text"
              value={values[attr.id] || ''}
              onChange={(e) => handleChange(attr.id, e.target.value)}
              required={attr.required}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          )}

          {attr.type === 'number' && (
            <input
              type="number"
              value={values[attr.id] || ''}
              onChange={(e) => handleChange(attr.id, e.target.value)}
              required={attr.required}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          )}

          {attr.type === 'select' && (
            <select
              value={values[attr.id] || ''}
              onChange={(e) => handleChange(attr.id, e.target.value)}
              required={attr.required}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select {attr.name}</option>
              {attr.options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )}

          {attr.type === 'color' && (
            <div className="flex gap-2">
              <input
                type="color"
                value={values[attr.id] || '#000000'}
                onChange={(e) => handleChange(attr.id, e.target.value)}
                className="w-12 h-10 cursor-pointer rounded"
              />
              <input
                type="text"
                value={values[attr.id] || ''}
                onChange={(e) => handleChange(attr.id, e.target.value)}
                placeholder="#000000"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {attr.type === 'size' && (
            <select
              value={values[attr.id] || ''}
              onChange={(e) => handleChange(attr.id, e.target.value)}
              required={attr.required}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select size</option>
              {attr.options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )}

          {attr.type === 'multiselect' && (
            <div className="space-y-2">
              {attr.options.map(opt => (
                <label key={opt} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={opt}
                    checked={(values[attr.id] || '').split(',').includes(opt)}
                    onChange={(e) => {
                      const current = (values[attr.id] || '').split(',').filter(v => v);
                      const updated = e.target.checked
                        ? [...current, opt]
                        : current.filter(v => v !== opt);
                      handleChange(attr.id, updated.join(','));
                    }}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
