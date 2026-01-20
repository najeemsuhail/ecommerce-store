'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';

interface ProductVideoProps {
  videoUrl?: string;
  productName?: string;
  className?: string;
}

export default function ProductVideo({
  videoUrl,
  productName = 'Product Demo',
  className = '',
}: ProductVideoProps) {
  const [isLoading, setIsLoading] = useState(true);

  if (!videoUrl) {
    return null;
  }

  // Extract YouTube video ID from various URL formats
  const getYoutubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match?.[1]) {
        return match[1];
      }
    }
    return null;
  };

  const videoId = getYoutubeId(videoUrl);

  if (!videoId) {
    return null;
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}`;

  return (
    <div className={`${className}`}>
      <div className="mb-4">
        <h3 className="font-semibold text-lg">Product Video</h3>
        <div className="mt-2 h-1 w-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
      </div>

      <div className="relative bg-black rounded-lg shadow-lg overflow-hidden group">
        {/* Video Container */}
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src={embedUrl}
            title={productName}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            onLoad={() => setIsLoading(false)}
          ></iframe>

          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
              <div className="animate-pulse">
                <FontAwesomeIcon
                  icon={faPlay}
                  className="text-red-600 text-4xl"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-600 mt-3">
        Watch {productName.toLowerCase()} demo video
      </p>
    </div>
  );
}
