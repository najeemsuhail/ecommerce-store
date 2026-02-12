'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faCheckCircle, faTimesCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';

interface DeliveryPinCheckResult {
  available: boolean;
  pinCode: string;
  type?: string;
  message?: string;
}

export default function DeliveryPinChecker() {
  const [pinCode, setPinCode] = useState('');
  const [result, setResult] = useState<DeliveryPinCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validatePinCode = (pin: string): boolean => {
    return /^\d{6}$/.test(pin);
  };

  const handleCheckDelivery = async () => {
    setError('');
    setResult(null);

    if (!validatePinCode(pinCode)) {
      setError('Please enter a valid 6-digit PIN code');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/delivery/check-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pinCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to check delivery availability');
      }

      setResult(data);
    } catch (error: any) {
      setError(error.message || 'Error checking delivery availability');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-purple-600 text-lg" />
        <h3 className="font-semibold text-gray-800">Check Delivery</h3>
      </div>

      {/* Form */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={pinCode}
            onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit PIN"
            maxLength={6}
            disabled={isLoading}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition disabled:bg-gray-100"
          />
          <button
            type="button"
            onClick={handleCheckDelivery}
            disabled={isLoading || pinCode.length !== 6}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium text-sm hover:bg-purple-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
            ) : (
              'Check'
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
            <FontAwesomeIcon icon={faTimesCircle} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`p-3 rounded-lg text-sm ${
            result.available
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-start gap-2">
              <FontAwesomeIcon
                icon={result.available ? faCheckCircle : faTimesCircle}
                className={`flex-shrink-0 mt-0.5 ${result.available ? 'text-green-600' : 'text-red-600'}`}
              />
              <div className="flex-1">
                <p className={`font-semibold ${result.available ? 'text-green-700' : 'text-red-700'}`}>
                  {result.available ? 'Delivery Available' : 'Not Available'}
                </p>
                {result.available && result.type && (
                  <p className="text-xs text-gray-600 mt-1">
                    {result.type === 'cod' && '✓ Cash on Delivery Available'}
                    {result.type === 'prepaid' && '✓ Prepaid Available'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
