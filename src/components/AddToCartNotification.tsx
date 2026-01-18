'use client';

import { useState, useEffect } from 'react';

interface AddToCartNotificationProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export default function AddToCartNotification({
  message,
  isVisible,
  onClose,
}: AddToCartNotificationProps) {
  useEffect(() => {
    if (isVisible && message) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible || !message) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-right duration-300">
      <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 max-w-xs">
        <svg
          className="w-5 h-5 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
          />
        </svg>
        <span className="font-semibold text-sm">{message}</span>
      </div>
    </div>
  );
}
