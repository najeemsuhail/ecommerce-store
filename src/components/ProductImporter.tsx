'use client';

import { useState } from 'react';

interface ImportResult {
  imported: number;
  updated: number;
  failed: number;
  errors: Array<{ index: number; name: string; error: string }>;
}

export default function ProductImporter() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [message, setMessage] = useState('');
  const [showTemplate, setShowTemplate] = useState(false);

  const downloadTemplate = () => {
    const template = [
      {
        externalId: 9727470469430,
        name: 'Colourful Reflection Diya Combo Plastic Candle Cup',
        description: 'Product description with HTML support',
        price: 51.0,
        comparePrice: 199.0,
        sku: 'SKU-001',
        stock: 100,
        brand: 'Indo Glow',
        slug: 'colorful-reflection-diya', // optional, auto-generated if not provided
        tags: ['diwali', 'gift', 'home-decor'],
        category: 'home-essential', // can be string or array of strings
        images: [
          'https://example.com/image1.jpg',
          'https://example.com/image2.jpg',
        ],
        videoUrl: 'https://example.com/video.mp4',
        weight: 0.5,
        metaTitle: 'Meta Title for SEO',
        metaDescription: 'Meta description for SEO',
        isDigital: false,
        trackInventory: true,
        isFeatured: true,
        isActive: true,
        source: 'deodap',
        variants: [
          {
            externalId: 50511442084150,
            name: 'Default Title',
            sku: 'SKU-001-VAR',
            price: 51.0,
            comparePrice: 199.0,
            available: true,
            stock: 100,
            size: 'Default Title',
            color: null,
            material: null,
          },
        ],
        attributes: {
          size: ['Default Title'],
        },
      },
    ];

    const dataStr = JSON.stringify(template, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'products-template.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/json') {
        setMessage('Please select a JSON file');
        return;
      }
      setFile(selectedFile);
      setMessage('');
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setMessage('Please select a file');
      return;
    }

    setLoading(true);
    setMessage('Processing import...');
    setResult(null);

    try {
      const fileContent = await file.text();
      let jsonData;
      try {
        jsonData = JSON.parse(fileContent);
      } catch {
        setMessage('✗ Invalid JSON format');
        return;
      }

      const products = Array.isArray(jsonData) ? jsonData : [jsonData];
      const CHUNK_SIZE = 10; // Process 10 products per chunk
      const totalChunks = Math.ceil(products.length / CHUNK_SIZE);

      const aggregatedResults: ImportResult = {
        imported: 0,
        updated: 0,
        failed: 0,
        errors: [],
      };

      const token = localStorage.getItem('token');
      let categoryCache: any[] = [];

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, products.length);
        const chunk = products.slice(start, end);

        setMessage(`Processing ${end} / ${products.length} products...`);

        const response = await fetch('/api/admin/products/import-chunk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ products: chunk, categoryCache }),
        });

        const responseText = await response.text();
        let data: {
          success?: boolean;
          results?: ImportResult;
          categoryCache?: any[];
          error?: string;
        } | null = null;

        try {
          data = responseText ? JSON.parse(responseText) : null;
        } catch {
          data = null;
        }

        if (!response.ok || !data?.success) {
          const fallback = responseText ? responseText.slice(0, 300) : response.statusText;
          setMessage(`✗ Error at chunk ${chunkIndex + 1}: ${data?.error || fallback || 'Import failed'}`);
          setResult(aggregatedResults);
          return;
        }

        // Aggregate results
        if (data.results) {
          aggregatedResults.imported += data.results.imported;
          aggregatedResults.updated += data.results.updated;
          aggregatedResults.failed += data.results.failed;
          aggregatedResults.errors.push(
            ...data.results.errors.map((err) => ({
              ...err,
              index: err.index + start, // Adjust index for global position
            }))
          );
        }

        // Update category cache
        if (data.categoryCache) {
          categoryCache = data.categoryCache;
        }
      }

      setResult(aggregatedResults);
      setMessage(
        `✓ Import completed: ${aggregatedResults.imported} imported, ${aggregatedResults.updated} updated, ${aggregatedResults.failed} failed`
      );
      setFile(null);
      if (document.querySelector('input[type="file"]') as HTMLInputElement) {
        (document.querySelector('input[type="file"]') as HTMLInputElement).value = '';
      }
    } catch (error) {
      setMessage('✗ Failed to import products');
      console.error('Import error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Import Products</h2>
        <button
          onClick={() => setShowTemplate(!showTemplate)}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          {showTemplate ? 'Hide' : 'Show'} Help
        </button>
      </div>

      {showTemplate && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-semibold mb-2">JSON Format Guide</h3>
          <p className="text-sm text-gray-700 mb-3">
            Your JSON file should contain an array of products with the following fields:
          </p>
          <div className="bg-white p-3 rounded border border-blue-100 text-xs overflow-auto mb-3 font-mono">
            <pre>{`[
  {
    "externalId": 9727470469430,                 // Optional - external reference ID
    "name": "Product Name",                      // Required
    "description": "Description (HTML ok)",      // Required
    "price": 29.99,                              // Required
    "comparePrice": 39.99,                       // Optional - strikethrough price
    "sku": "SKU-001",                            // Optional - unique SKU
    "stock": 100,                                // Optional (default: 0)
    "brand": "Brand Name",                       // Optional
    "slug": "custom-slug",                       // Optional (auto-generated)
    "source": "deodap",                          // Optional (default: "deodap")
    "tags": ["tag1", "tag2"],                    // Optional
    "category": "category-slug",                 // Optional (string or array)
    "images": ["https://..."],                   // Optional
    "videoUrl": "https://...",                   // Optional
    "weight": 0.5,                               // Optional
    "metaTitle": "SEO Title",                    // Optional
    "metaDescription": "SEO Description",        // Optional
    "isDigital": false,                          // Optional
    "trackInventory": true,                      // Optional
    "isFeatured": false,                         // Optional
    "isActive": true,                            // Optional
    "variants": [                                // Optional - product variants
      {
        "externalId": 50511442084150,
        "name": "Variant Name",
        "sku": "SKU-VAR-001",
        "price": 29.99,
        "comparePrice": 39.99,
        "available": true,
        "stock": 50,
        "size": "M",
        "color": "Red",
        "material": "Cotton"
      }
    ],
    "attributes": {                              // Optional - product attributes
      "size": ["M", "L", "XL"]
    }
  }
]`}</pre>
          </div>
          <button
            onClick={downloadTemplate}
            className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            Download Template
          </button>
        </div>
      )}

      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded p-6 bg-gray-50">
          <input
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="w-full"
            disabled={loading}
          />
          {file && <p className="mt-2 text-sm text-green-600">✓ {file.name} selected</p>}
        </div>

        <button
          onClick={handleImport}
          disabled={!file || loading}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
        >
          {loading ? 'Importing...' : 'Import Products'}
        </button>

        {message && (
          <div
            className={`p-3 rounded ${
              message.startsWith('✓')
                ? 'bg-green-100 text-green-800 border border-green-300'
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}
          >
            {message}
          </div>
        )}

        {result && (
          <div className="mt-6 p-4 bg-gray-50 rounded border border-gray-300">
            <h3 className="font-bold mb-3">Import Results</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-green-50 p-3 rounded">
                <p className="text-sm text-gray-600">Imported</p>
                <p className="text-2xl font-bold text-green-600">{result.imported}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-sm text-gray-600">Updated</p>
                <p className="text-2xl font-bold text-blue-600">{result.updated}</p>
              </div>
              <div className="bg-red-50 p-3 rounded">
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{result.failed}</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-sm mb-2">Errors:</h4>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {result.errors.map((err, idx) => (
                    <div key={idx} className="text-sm p-2 bg-red-50 border border-red-200 rounded">
                      <strong>Row {err.index} ({err.name}):</strong> {err.error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
