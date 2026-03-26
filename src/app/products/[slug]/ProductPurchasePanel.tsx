'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import AddToWishlistModal from '@/components/AddToWishlistModal';
import AddToCartNotification from '@/components/AddToCartNotification';
import DeliveryPinChecker from '@/components/DeliveryPinChecker';
import ShareProduct from '@/components/ShareProduct';
import WhatsAppOrderButton from '@/components/WhatsAppOrderButton';
import { useStoreSettings } from '@/contexts/StoreSettingsContext';
import { formatPrice } from '@/lib/currency';
import { trackViewItem } from '@/lib/analytics';
import { buildProductWhatsAppMessage } from '@/lib/whatsapp';
import type { ProductVariant } from '@/lib/productDetail';

interface ProductPurchasePanelProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
    isDigital: boolean;
    isActive: boolean;
    stock: number | null;
    weight?: number | null;
    variants: ProductVariant[];
  };
}

export default function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const { addItem } = useCart();
  const { isInWishlist } = useWishlist();
  const { storeName, domain } = useStoreSettings();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants.length > 0 ? product.variants[0] : null
  );
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [wishlistModalOpen, setWishlistModalOpen] = useState(false);

  const activePrice = selectedVariant ? selectedVariant.price : product.price;
  const canPurchase = product.isActive && (!selectedVariant || selectedVariant.isActive !== false);
  const productUrl = domain ? `${domain.replace(/\/$/, '')}/products/${product.slug}` : undefined;
  const whatsappMessage = buildProductWhatsAppMessage({
    storeName,
    productName: product.name,
    quantity,
    price: activePrice,
    variantName: selectedVariant?.name,
    productUrl,
  });

  useEffect(() => {
    trackViewItem({
      item_id: product.id,
      item_name: product.name,
      item_variant: selectedVariant?.name,
      price: activePrice,
      quantity: 1,
    });
  }, [activePrice, product.id, product.name, selectedVariant?.name]);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      variantId: selectedVariant?.id,
      variantName: selectedVariant?.name,
      name: product.name,
      price: activePrice,
      quantity,
      image: product.images[0],
      slug: product.slug,
      isDigital: product.isDigital,
      weight: product.weight || undefined,
    });

    setNotificationMessage(
      `${quantity} x ${product.name}${selectedVariant ? ` (${selectedVariant.name})` : ''} added to cart!`
    );
    setShowNotification(true);

    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  return (
    <>
      {product.variants.length > 1 && (
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-3">Variants</h3>
          <div className="grid grid-cols-2 gap-3">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedVariant?.id === variant.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                } ${variant.isActive === false ? 'opacity-50' : ''}`}
                disabled={variant.isActive === false}
              >
                <div className="text-left">
                  <p className="font-semibold text-sm">{variant.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-primary-theme font-bold text-sm">{formatPrice(variant.price)}</p>
                  </div>
                  {variant.isActive === false ? (
                    <p className="text-red-600 text-xs mt-1 font-semibold">Not Available</p>
                  ) : (
                    <p className="text-green-600 text-xs mt-1 font-semibold">Available</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {!product.isDigital && (
        <div className="mb-6">
          <DeliveryPinChecker />
        </div>
      )}

      {canPurchase && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="font-semibold">Quantity:</label>
            <div className="flex items-center border rounded">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 hover:bg-gray-100"
              >
                -
              </button>
              <span className="px-6 py-2 border-x">{quantity}</span>
              <button
                onClick={() =>
                  setQuantity(
                    Math.min(
                      product.isDigital ? 999 : selectedVariant?.stock ?? product.stock ?? 999,
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
            <button onClick={handleAddToCart} className="btn-primary-lg flex-1">
              Add to Cart - {formatPrice(activePrice * quantity)}
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

            {showNotification && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-success-theme text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
                <span className="text-xl">✓</span>
                <span className="font-medium">{notificationMessage}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <WhatsAppOrderButton
              message={whatsappMessage}
              label={`Buy on WhatsApp - ${formatPrice(activePrice * quantity)}`}
              className="w-full"
              unavailableLabel="WhatsApp number not set"
            />
            <p className="text-sm text-gray-500">
              Send this product selection to our team and complete the purchase on WhatsApp.
            </p>
          </div>
        </div>
      )}

      <br />

      <ShareProduct
        productName={product.name}
        productSlug={product.slug}
        productImage={product.images[0]}
        productPrice={formatPrice(activePrice)}
      />

      <AddToCartNotification
        isVisible={showNotification}
        message={notificationMessage}
        onClose={() => setShowNotification(false)}
      />

      <AddToWishlistModal
        isOpen={wishlistModalOpen}
        onClose={() => setWishlistModalOpen(false)}
        productId={product.id}
        productName={product.name}
        productPrice={activePrice}
        productImage={product.images[0]}
        productSlug={product.slug}
      />
    </>
  );
}
