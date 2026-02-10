'use client';

import { useState } from 'react';

interface CouponInputProps {
  orderTotal: number;
  onCouponApplied?: (discount: number, code: string, couponId: string) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
  appliedCode?: string;
}

export default function CouponInput({
  orderTotal,
  onCouponApplied,
  onError,
  disabled = false,
  appliedCode,
}: CouponInputProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [discount, setDiscount] = useState(0);
  const [appliedCouponId, setAppliedCouponId] = useState<string | null>(null);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      setMessage('Please enter a coupon code');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code.trim(),
          orderTotal,
        }),
      });

      const result = await response.json();

      if (result.valid) {
        setMessage(result.message);
        setMessageType('success');
        setDiscount(result.discount);
        setAppliedCouponId(result.couponId);
        setCode('');

        if (onCouponApplied) {
          onCouponApplied(result.discount, code.trim(), result.couponId);
        }
      } else {
        setMessage(result.message);
        setMessageType('error');
        setDiscount(0);
        setAppliedCouponId(null);

        if (onError) {
          onError(result.message);
        }
      }
    } catch (error) {
      const errorMessage = 'Failed to validate coupon';
      setMessage(errorMessage);
      setMessageType('error');
      setDiscount(0);

      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Show applied coupon info if passed as prop
  if (appliedCode && discount > 0) {
    return (
      <div className="space-y-4 rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-medium text-green-900">Coupon Applied</p>
              <p className="text-sm text-green-700">{appliedCode}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-green-600">
              -${discount.toFixed(2)}
            </p>
            <p className="text-xs text-green-600">Discount</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleApplyCoupon} className="flex gap-2">
        <input
          type="text"
          placeholder="Enter coupon code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          disabled={disabled || loading}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
        />
        <button
          type="submit"
          disabled={disabled || loading || !code.trim()}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span>⏳ Applying...</span>
          ) : (
            'Apply Coupon'
          )}
        </button>
      </form>

      {message && (
        <div
          className={`flex gap-2 rounded-lg p-3 text-sm ${
            messageType === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          <span className="text-lg flex-shrink-0">
            {messageType === 'success' ? '✅' : '⚠️'}
          </span>
          <p>{message}</p>
        </div>
      )}

      {discount > 0 && (
        <div className="rounded-lg bg-green-50 p-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Discount Applied:</span>
            <span className="font-semibold text-green-600">
              -${discount.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
