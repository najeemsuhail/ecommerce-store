'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import Layout from '@/components/Layout';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem, totalItems } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (params.slug) {
      fetchProduct();
    }
  }, [params.slug]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.slug}`);
      const data = await response.json();
      if (data.success) {
        setProduct(data.product);
      } else {
        router.push('/products');
      }
    } catch (error) {
      console.error('Failed to fetch product');
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images?.[0],
      slug: product.slug,
      isDigital: product.isDigital,
    });

    alert(`${quantity} x ${product.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Product not found</p>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
          {/* Product Detail */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="mb-6 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>
            {' / '}
            <Link href="/products" className="hover:text-blue-600">
              Products
            </Link>
            {' / '}
            <span>{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Images */}
            <div>
              <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
                <div className="relative h-96 bg-gray-200 rounded overflow-hidden">
                  {product.images?.[selectedImage] ? (
                    <img
                      src={product.images[selectedImage]}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2">
                  {product.images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 border-2 rounded overflow-hidden ${
                        selectedImage === index
                          ? 'border-blue-600'
                          : 'border-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <div className="bg-white rounded-lg shadow-lg p-6">
                {/* Title and Price */}
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                
                {product.brand && (
                  <p className="text-gray-600 mb-4">Brand: {product.brand}</p>
                )}

                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl font-bold text-blue-600">
                    ${product.price}
                  </span>
                  {product.comparePrice && (
                    <span className="text-xl text-gray-500 line-through">
                      ${product.comparePrice}
                    </span>
                  )}
                </div>

                {/* Rating */}
                {product.averageRating > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex text-yellow-400">
                      {'★'.repeat(Math.round(product.averageRating))}
                      {'☆'.repeat(5 - Math.round(product.averageRating))}
                    </div>
                    <span className="text-sm text-gray-600">
                      ({product.reviewCount} reviews)
                    </span>
                  </div>
                )}

                {/* Stock Status */}
                {!product.isDigital && (
                  <div className="mb-6">
                    {product.stock > 0 ? (
                      <span className="text-green-600 font-semibold">
                        ✓ In Stock ({product.stock} available)
                      </span>
                    ) : (
                      <span className="text-red-600 font-semibold">
                        ✗ Out of Stock
                      </span>
                    )}
                  </div>
                )}

                {/* Description */}
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-line">
                    {product.description}
                  </p>
                </div>

                {/* Specifications */}
                {product.specifications && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-2">Specifications</h3>
                    <div className="bg-gray-50 rounded p-4 space-y-2">
                      {Object.entries(product.specifications).map(
                        ([key, value]: [string, any]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600">{key}:</span>
                            <span className="font-semibold">
                              {Array.isArray(value) ? value.join(', ') : String(value)}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Quantity and Add to Cart */}
                {(!product.isDigital ? product.stock > 0 : true) && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <label className="font-semibold">Quantity:</label>
                      <div className="flex items-center border rounded">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-4 py-2 hover:bg-gray-100"
                        >
                          −
                        </button>
                        <span className="px-6 py-2 border-x">{quantity}</span>
                        <button
                          onClick={() =>
                            setQuantity(
                              Math.min(
                                product.isDigital ? 999 : product.stock,
                                quantity + 1
                              )
                            )
                          }
                          className="px-4 py-2 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleAddToCart}
                      className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 font-semibold text-lg"
                    >
                      Add to Cart - ${(product.price * quantity).toFixed(2)}
                    </button>
                  </div>
                )}

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="mt-6">
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          {product.reviews && product.reviews.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
              <div className="space-y-4">
                {product.reviews.map((review: any) => (
                  <div key={review.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex text-yellow-400">
                        {'★'.repeat(review.rating)}
                        {'☆'.repeat(5 - review.rating)}
                      </div>
                      <span className="text-sm text-gray-600">
                        by {review.user?.name || 'Anonymous'}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-gray-700">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}