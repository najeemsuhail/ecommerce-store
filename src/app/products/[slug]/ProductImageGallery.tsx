'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlassPlus } from '@fortawesome/free-solid-svg-icons';
import ProductVideo from '@/components/ProductVideo';

interface ProductImageGalleryProps {
  productName: string;
  images: string[];
  videoUrl?: string | null;
}

export default function ProductImageGallery({
  productName,
  images,
  videoUrl,
}: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const hasImages = images.length > 0;

  const handlePrevImage = () => {
    if (!hasImages) return;
    setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (!hasImages) return;
    setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleImageZoom = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
    setShowImageZoom(true);
  };

  return (
    <div className="lg:sticky lg:top-8 h-fit">
      <div className="bg-light-theme rounded-lg shadow-lg p-4 mb-4 relative group">
        <div
          className="relative bg-gray-200 rounded overflow-hidden aspect-square"
          style={{ cursor: showImageZoom ? 'zoom-out' : 'default' }}
          onMouseMove={showImageZoom ? handleImageZoom : undefined}
        >
          {images[selectedImage] ? (
            <Image
              src={images[selectedImage]}
              alt={productName}
              fill
              priority={selectedImage === 0}
              sizes="(max-width: 1024px) 100vw, 50vw"
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

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute inset-y-0 left-0 z-[1] w-1/2"
                aria-label="Previous image"
              />
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute inset-y-0 right-0 z-[1] w-1/2"
                aria-label="Next image"
              />
            </>
          )}

          <button
            type="button"
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

        {images.length > 1 && (
          <div className="mt-4">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-all duration-200 hover:shadow-md ${
                    selectedImage === index
                      ? 'border-blue-600 ring-2 ring-blue-300'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  title={`Image ${index + 1}`}
                >
                  <Image
                    src={image}
                    alt={`${productName} ${index + 1}`}
                    fill
                    sizes="80px"
                    className="object-contain"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {videoUrl && (
          <div className="mt-8">
            <ProductVideo videoUrl={videoUrl} productName={productName} />
          </div>
        )}
      </div>
    </div>
  );
}
