'use client';

import { useEffect, useState } from 'react';

interface ProductAttribute {
  attribute: {
    id: string;
    name: string;
    slug: string;
    type: string;
  };
  value: string;
}

interface ProductAttributeDisplayProps {
  productId: string;
}

export default function ProductAttributeDisplay({ productId }: ProductAttributeDisplayProps) {
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttributes();
  }, [productId]);

  const fetchAttributes = async () => {
    try {
      const res = await fetch(`/api/admin/product-attributes?productId=${productId}`);
      if (!res.ok) throw new Error('Failed to fetch attributes');
      const data = await res.json();
      setAttributes(data);
    } catch (err) {
      console.error('Failed to load attributes:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || attributes.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 pt-8 border-t">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Attributes</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {attributes.map((attr) => (
          <div key={attr.attribute.id} className="flex flex-col">
            <span className="text-sm font-medium text-gray-600">{attr.attribute.name}</span>
            <span className="text-base text-gray-900">
              {attr.attribute.type === 'color' ? (
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded border border-gray-300"
                    style={{ backgroundColor: attr.value }}
                  />
                  <span>{attr.value}</span>
                </div>
              ) : attr.attribute.type === 'multiselect' ? (
                <div className="flex flex-wrap gap-2">
                  {attr.value.split(',').map((val) => (
                    <span
                      key={val}
                      className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                    >
                      {val.trim()}
                    </span>
                  ))}
                </div>
              ) : (
                attr.value
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
