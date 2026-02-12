'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faCheckCircle, faTimesCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';

interface DeliveryPinCheckResult {
  available: boolean;
  pinCode: string;
  type?: string; // 'cod' or 'prepaid'
  message?: string;
}

export default function DeliveryPinChecker() {
  const [pinCode, setPinCode] = useState('');
  const [result, setResult] = useState<DeliveryPinCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const validatePinCode = (pin: string): boolean => {
    return /^\d{6}$/.test(pin);
  };

  const handleCheckDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleReset = () => {
    setPinCode('');
    setResult(null);
    setError('');
  };

  return (
    <div className="w-full">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg hover:border-blue-500/50 transition-all"
      >
        <div className="flex items-center gap-3">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-500 text-lg" />
          <span className="font-semibold text-white">Check Delivery Availability</span>
        </div>
        <span className={`text-xl text-blue-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="mt-4 p-6 bg-slate-800/50 border border-slate-700 rounded-lg space-y-4">
          <form onSubmit={handleCheckDelivery} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Enter PIN Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="e.g., 110001"
                  maxLength={6}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={isLoading || pinCode.length !== 6}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                  ) : (
                    'Check'
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 flex items-center gap-3">
                <FontAwesomeIcon icon={faTimesCircle} />
                <span>{error}</span>
              </div>
            )}

            {result && (
              <div className={`p-4 rounded-lg border ${
                result.available
                  ? 'bg-green-500/20 border-green-500/30'
                  : 'bg-red-500/20 border-red-500/30'
              }`}>
                <div className="flex items-start gap-3">
                  <FontAwesomeIcon
                    icon={result.available ? faCheckCircle : faTimesCircle}
                    className={`text-lg mt-1 ${result.available ? 'text-green-400' : 'text-red-400'}`}
                  />
                  <div className="flex-1">
                    <p className={`font-semibold ${result.available ? 'text-green-300' : 'text-red-300'}`}>
                      {result.available ? 'Delivery Available' : 'Delivery Not Available'}
                    </p>
                    <p className="text-sm text-gray-300 mt-1">
                      PIN Code: <span className="font-mono font-semibold">{result.pinCode}</span>
                    </p>
                    
                    {/* Payment Methods */}
                    {result.available && result.type && (
                      <div className="mt-3">
                        <p className="text-sm font-semibold text-gray-300 mb-2">Available Payment Method:</p>
                        {result.type === 'prepaid' && (
                          <span className="inline-block bg-blue-500/30 text-blue-300 px-3 py-1 rounded text-xs font-semibold">
                            💳 Prepaid Available
                          </span>
                        )}
                        {result.type === 'cod' && (
                          <span className="inline-block bg-green-500/30 text-green-300 px-3 py-1 rounded text-xs font-semibold">
                            📦 Cash on Delivery Available
                          </span>
                        )}
                      </div>
                    )}
                    
                    {result.message && (
                      <p className="text-sm text-gray-300 mt-2 italic">{result.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </form>

          {result && (
            <button
              onClick={handleReset}
              type="button"
              className="w-full px-4 py-2 text-sm text-blue-400 hover:text-blue-300 border border-blue-500/30 rounded-lg hover:border-blue-500/50 transition"
            >
              Check Another PIN Code
            </button>
          )}

          <div className="pt-4 border-t border-slate-700">
            <p className="text-xs text-gray-400">
              💁 <strong>Tip:</strong> Enter your 6-digit PIN code to check if we deliver to your area and available payment methods.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
