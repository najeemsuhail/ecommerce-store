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
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-right duration-300">
      <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-xs">
        <svg
          className="w-5 h-5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}
