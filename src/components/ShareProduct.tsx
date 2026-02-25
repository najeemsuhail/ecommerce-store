'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWhatsapp,
  faFacebookF,
  faXTwitter,
  faTelegram,
  faPinterestP,
} from '@fortawesome/free-brands-svg-icons';
import { faLink, faShareNodes } from '@fortawesome/free-solid-svg-icons';

interface ShareProductProps {
  productName: string;
  productSlug: string;
  productImage?: string;
  productPrice?: string;
}

export default function ShareProduct({
  productName,
  productSlug,
  productImage,
  productPrice,
}: ShareProductProps) {
  const [copied, setCopied] = useState(false);
  const [productUrl, setProductUrl] = useState('');

  useEffect(() => {
    setProductUrl(`${window.location.origin}/products/${productSlug}`);
  }, [productSlug]);

  const encodedUrl = encodeURIComponent(productUrl);
  const encodedText = encodeURIComponent(
    `Check out ${productName}${productPrice ? ` - ${productPrice}` : ''}!`
  );

  const shareLinks = [
    {
      name: 'WhatsApp',
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      bg: 'bg-[#25D366] hover:bg-[#1ebe57]',
      icon: faWhatsapp,
    },
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      bg: 'bg-[#1877F2] hover:bg-[#0d6efd]',
      icon: faFacebookF,
    },
    {
      name: 'Telegram',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      bg: 'bg-[#0088cc] hover:bg-[#0077b5]',
      icon: faTelegram,
    },
    {
      name: 'Pinterest',
      href: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodeURIComponent(
        productImage || ''
      )}&description=${encodedText}`,
      bg: 'bg-[#E60023] hover:bg-[#cc001f]',
      icon: faPinterestP,
    },
  ];

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(productUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: productName,
        text: `Check out ${productName}${productPrice ? ` - ${productPrice}` : ''}!`,
        url: productUrl,
      });
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">

        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            title={link.name}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 ${link.bg}`}
          >
            <FontAwesomeIcon icon={link.icon} className="text-lg" />
          </a>
        ))}

        {/* Copy link */}
        <button
          onClick={handleCopyLink}
          title="Copy link"
          className={`w-10 h-10 rounded-full flex items-center justify-center border transition ${
            copied
              ? 'bg-green-500 text-white border-green-500'
              : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
          }`}
        >
          <FontAwesomeIcon icon={faLink} />
        </button>

        {/* Native mobile share */}
        {'share' in navigator && (
          <button
            onClick={handleNativeShare}
            title="Share"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200"
          >
            <FontAwesomeIcon icon={faShareNodes} />
          </button>
        )}
      </div>
    </div>
  );
}