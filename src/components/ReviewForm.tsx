'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ReviewFormProps {
  productId: string;
  productName: string;
  onReviewSubmitted?: () => void;
}

export default function ReviewForm({ productId, productName, onReviewSubmitted }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      setMessage({ type: 'info', text: 'Please log in to submit a review' });
      router.push('/auth?redirect=' + window.location.pathname);
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          rating,
          comment: comment.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setMessage({ type: 'success', text: 'Review submitted successfully!' });
      setComment('');
      setRating(5);

      // Refresh the page to show the new review
      setTimeout(() => {
        window.location.reload();
      }, 1500);

      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to submit review' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <p className="text-gray-700 mb-4">Sign in to share your thoughts about this product</p>
        <button
          onClick={() => router.push('/auth?redirect=' + window.location.pathname)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Sign In / Sign Up
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-light-theme rounded-lg shadow-md p-8 mb-8">
      <h3 className="text-xl font-bold mb-6">Share Your Review</h3>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : message.type === 'error'
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold mb-3">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-3xl transition-transform hover:scale-110 ${
                  star <= rating ? 'text-yellow-400' : 'text-gray-300'
                }`}
                title={`${star} star${star !== 1 ? 's' : ''}`}
              >
                ★
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very Good'}
            {rating === 5 && 'Excellent'}
          </p>
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="comment" className="block text-sm font-semibold mb-3">
            Your Review (Optional)
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about this product..."
            rows={4}
            maxLength={1000}
            disabled={isLoading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            {comment.length}/1000 characters
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
}
