'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import Link from 'next/link';
import Layout from '@/components/Layout';
import AddToWishlistModal from '@/components/AddToWishlistModal';
import AddToCartNotification from '@/components/AddToCartNotification';
import { formatPrice } from '@/lib/currency';
import ProductRecommendations from '@/components/ProductRecommendations';
import ProductVideo from '@/components/ProductVideo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faMagnifyingGlassPlus } from '@fortawesome/free-solid-svg-icons';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem, totalItems } = useCart();
  const { isInWishlist } = useWishlist();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [wishlistModalOpen, setWishlistModalOpen] = useState(false);
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

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
        // Set first variant as default if variants exist
        if (data.product.variants && data.product.variants.length > 0) {
          setSelectedVariant(data.product.variants[0]);
        }
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

  const handlePrevImage = () => {
    setSelectedImage((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setSelectedImage((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleImageZoom = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
    setShowImageZoom(true);
  };

  const handleAddToCart = () => {
    if (!product) return;

    const cartItem: any = {
      productId: product.id,
      name: product.name,
      price: selectedVariant ? selectedVariant.price : product.price,
      quantity,
      image: product.images?.[0],
      slug: product.slug,
      isDigital: product.isDigital,
    };

    if (selectedVariant) {
      cartItem.variantId = selectedVariant.id;
      cartItem.variantName = selectedVariant.name;
    }

    addItem(cartItem);

    // Show notification
    const message = `${quantity} x ${product.name}${selectedVariant ? ` (${selectedVariant.name})` : ''} added to cart!`;
    setNotificationMessage(message);
    setShowNotification(true);

    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
            {/* Breadcrumb Skeleton */}
            <div className="mb-6 h-4 w-48 bg-gray-300 rounded"></div>

            {/* Product Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Images Gallery Skeleton */}
              <div>
                {/* Main Image Skeleton */}
                <div className="bg-gray-300 rounded-lg shadow-lg p-4 mb-4 h-96"></div>
                
                {/* Thumbnails Skeleton */}
                <div className="flex gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-16 h-16 bg-gray-300 rounded"></div>
                  ))}
                </div>
              </div>

              {/* Product Info Skeleton */}
              <div className="space-y-6">
                {/* Title Skeleton */}
                <div className="space-y-2">
                  <div className="h-8 w-3/4 bg-gray-300 rounded"></div>
                  <div className="h-6 w-1/2 bg-gray-300 rounded"></div>
                </div>

                {/* Price Skeleton */}
                <div className="h-10 w-32 bg-gray-300 rounded"></div>

                {/* Rating Skeleton */}
                <div className="h-6 w-48 bg-gray-300 rounded"></div>

                {/* Stock Status Skeleton */}
                <div className="h-6 w-40 bg-gray-300 rounded"></div>

                {/* Description Skeleton */}
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-300 rounded"></div>
                  <div className="h-4 w-full bg-gray-300 rounded"></div>
                  <div className="h-4 w-2/3 bg-gray-300 rounded"></div>
                </div>

                {/* Variants Skeleton */}
                <div className="space-y-2">
                  <div className="h-6 w-32 bg-gray-300 rounded"></div>
                  <div className="grid grid-cols-2 gap-3">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="h-20 bg-gray-300 rounded"></div>
                    ))}
                  </div>
                </div>

                {/* Quantity and Button Skeleton */}
                <div className="space-y-3">
                  <div className="flex gap-4 items-center">
                    <div className="h-10 w-32 bg-gray-300 rounded"></div>
                    <div className="h-10 w-12 bg-gray-300 rounded"></div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 h-14 bg-gray-300 rounded"></div>
                    <div className="h-14 w-14 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
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
            <Link href="/" className="hover:text-primary-theme">
              Home
            </Link>
            {' / '}
            <Link href="/products" className="hover:text-primary-theme">
              Products
            </Link>
            {' / '}
            <span>{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Images Gallery */}
            <div>
              {/* Main Image */}
              <div className="bg-light-theme rounded-lg shadow-lg p-4 mb-4 relative group">
                <div
                  className="relative h-96 bg-gray-200 rounded overflow-hidden"
                  style={{ cursor: showImageZoom ? 'zoom-out' : 'default' }}
                  onMouseMove={showImageZoom ? handleImageZoom : undefined}
                >
                  {product.images?.[selectedImage] ? (
                    <img
                      src={product.images[selectedImage]}
                      alt={product.name}
                      className={`w-full h-full object-contain transition-transform duration-200 ${
                        showImageZoom ? 'scale-150' : 'scale-100'
                      }`}
                      style={
                        showImageZoom
                          ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` }
                          : undefined
                      }
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}

                  {/* Zoom Button */}
                  <button
                    onClick={() => setShowImageZoom(!showImageZoom)}
                    className={`absolute bottom-4 right-4 flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 z-10 ${
                      showImageZoom
                        ? 'bg-primary-theme text-white-theme hover:bg-primary-hover'
                        : 'bg-light-theme text-dark-theme border border-gray-300 hover:bg-light-gray-theme'
                    }`}
                    title={showImageZoom ? 'Exit zoom' : 'Click to zoom'}
                  >
                    <FontAwesomeIcon icon={faMagnifyingGlassPlus} className="w-4 h-4" />
                    <span className="text-sm">{showImageZoom ? 'Exit Zoom' : 'Zoom'}</span>
                  </button>
                </div>

              {/* Thumbnail Gallery */}
              {product.images && product.images.length > 1 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2 font-semibold">
                    Click to select image
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {product.images.map((image: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-all duration-200 hover:shadow-md ${
                          selectedImage === index
                            ? 'border-blue-600 ring-2 ring-blue-300'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        title={`Image ${index + 1}`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Video */}
              {product.videoUrl && (
                <div className="mt-8">
                  <ProductVideo 
                    videoUrl={product.videoUrl} 
                    productName={product.name}
                  />
                </div>
              )}
            </div>
            </div>

            {/* Product Info */}
            <div>
              <div className="bg-light-theme rounded-lg shadow-lg p-6">
                {/* Title and Price */}
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                
                {product.brand && (
                  <p className="text-gray-600 mb-4">Brand: {product.brand}</p>
                )}
   

                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl font-bold text-primary-theme">
                    ${selectedVariant ? selectedVariant.price : product.price}
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
                    {selectedVariant ? (
                      selectedVariant.stock > 0 ? (
                        <span className="text-green-600 font-semibold">
                          ✓ In Stock ({selectedVariant.stock} available)
                        </span>
                      ) : (
                        <span className="text-red-600 font-semibold">
                          ✗ Out of Stock
                        </span>
                      )
                    ) : (
                      product.stock > 0 ? (
                        <span className="text-green-600 font-semibold">
                          ✓ In Stock ({product.stock} available)
                        </span>
                      ) : (
                        <span className="text-red-600 font-semibold">
                          ✗ Out of Stock
                        </span>
                      )
                    )}
                  </div>
                )}

                {/* Description */}
                <div className="mb-6">
                  <div 
                    className="text-gray-700 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </div>

                {/* Specifications */}
                {/* Specifications */}
                {product.specifications && Object.keys(product.specifications).length > 0 && (
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

                {/* Product Attributes */}
                {product.attributes && product.attributes.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-2">Product Attributes</h3>
                    <div className="bg-gray-50 rounded p-4 space-y-2">
                      {product.attributes.map((attr: any) => (
                        <div key={attr.id} className="flex justify-between">
                          <span className="text-gray-600">{attr.attribute?.name || attr.attributeId}:</span>
                          <span className="font-semibold">{attr.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Variants */}
                {product.variants && product.variants.length > 1 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-3">Variants</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {product.variants.map((variant: any) => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariant(variant)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            selectedVariant?.id === variant.id
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-300 hover:border-gray-400'
                          } ${variant.stock === 0 ? 'opacity-50' : ''}`}
                          disabled={variant.stock === 0}
                        >
                          <div className="text-left">
                            <p className="font-semibold text-sm">{variant.name}</p>
                            <p className="text-primary-theme font-bold text-sm">
                              ${variant.price}
                            </p>
                            {variant.stock === 0 ? (
                              <p className="text-red-600 text-xs mt-1 font-semibold">Out of Stock</p>
                            ) : (
                              <p className="text-green-600 text-xs mt-1 font-semibold">
                                {variant.stock} available
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity and Add to Cart */}
                {(!product.isDigital ? (selectedVariant ? selectedVariant.stock > 0 : product.stock > 0) : true) && (
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
                                product.isDigital 
                                  ? 999 
                                  : (selectedVariant ? selectedVariant.stock : product.stock),
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

                    <div className="relative flex gap-4">
                      <button
                        onClick={handleAddToCart}
                        className="btn-primary-lg"
                      >
                        Add to Cart - {formatPrice((selectedVariant ? selectedVariant.price : product.price) * quantity)}
                      </button>
                      
                      <button
                        onClick={() => setWishlistModalOpen(true)}
                        className={`px-6 py-4 rounded-lg font-semibold text-lg transition-all ${
                          isInWishlist(product.id)
                            ? 'bg-red-100 text-red-600 border-2 border-red-300'
                            : 'bg-light-gray-theme text-dark-theme border-2 border-dark-theme hover:border-danger-theme hover:text-danger-theme'
                        }`}
                        title="Add to wishlist"
                      >
                        ♥
                      </button>

                      {/* Notification */}
                      {showNotification && (
                        <div className="absolute bottom-full left-0 right-0 mb-2 bg-success-theme text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
                          <span className="text-xl">✓</span>
                          <span className="font-medium">{notificationMessage}</span>
                        </div>
                      )}
                    </div>
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
                  <div key={review.id} className="bg-light-theme rounded-lg shadow p-6">
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

        {/* Product Recommendations */}
        {product && (
          <div className="mt-16 pt-12 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4">
              <ProductRecommendations 
                productId={product.id}
                limit={4}
                title="Similar Products You May Like"
                showTitle={true}
                className="mb-8"
                onAddToCart={(product) => {
                  addItem({
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                    image: product.images?.[0],
                    slug: product.slug,
                    isDigital: product.isDigital || false,
                  });
                  setNotificationMessage(`${product.name} added to cart!`);
                  setShowNotification(true);
                }}
              />
            </div>
          </div>
        )}
        
        {/* Notifications */}
        <AddToCartNotification 
          isVisible={showNotification}
          message={notificationMessage}
          onClose={() => setShowNotification(false)}
        />

        {/* Wishlist Modal */}
        <AddToWishlistModal
          isOpen={wishlistModalOpen}
          onClose={() => setWishlistModalOpen(false)}
          productId={product?.id || ''}
          productName={product?.name || ''}
          productPrice={selectedVariant ? selectedVariant.price : (product?.price || 0)}
          productImage={product?.images?.[0]}
          productSlug={product?.slug || ''}
        />
      </div>
    </Layout>
  );
}