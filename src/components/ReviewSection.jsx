
// ========================================
// frontend/src/components/ReviewSection.jsx (NEW)
// ========================================
import React, { useState, useEffect } from 'react';
import { reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ReviewSection = ({ propertyId }) => {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [averages, setAverages] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    rating: 5,
    cleanliness: 5,
    communication: 5,
    value_for_money: 5,
    comment: ''
  });

  useEffect(() => {
    loadReviews();
  }, [propertyId]);

  const loadReviews = async () => {
    try {
      const response = await reviewAPI.getByProperty(propertyId);
      setReviews(response.data.reviews);
      setAverages(response.data.averages);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await reviewAPI.create({
        property_id: propertyId,
        ...formData
      });
      alert('Review submitted successfully!');
      setShowReviewForm(false);
      loadReviews();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={`text-xl ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  if (loading) {
    return <div className="text-center py-8">Loading reviews...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Reviews & Ratings</h2>
        {isAuthenticated && user?.role === 'tenant' && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            ✍️ Write Review
          </button>
        )}
      </div>

      {/* Average Ratings */}
      {averages && averages.total_reviews > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-yellow-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-1">
              {averages.overall?.toFixed(1)}
            </div>
            <div className="flex justify-center mb-1">{renderStars(Math.round(averages.overall))}</div>
            <div className="text-sm text-gray-600">Overall Rating</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {averages.cleanliness?.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">🧹 Cleanliness</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {averages.communication?.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">💬 Communication</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {averages.value_for_money?.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">💰 Value</div>
          </div>
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg mb-6">
          <h3 className="font-bold text-lg mb-4">Write Your Review</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Overall Rating</label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {[5,4,3,2,1].map(n => (
                  <option key={n} value={n}>{n} Stars</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Cleanliness</label>
              <select
                value={formData.cleanliness}
                onChange={(e) => setFormData({...formData, cleanliness: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {[5,4,3,2,1].map(n => (
                  <option key={n} value={n}>{n} Stars</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Communication</label>
              <select
                value={formData.communication}
                onChange={(e) => setFormData({...formData, communication: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {[5,4,3,2,1].map(n => (
                  <option key={n} value={n}>{n} Stars</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Value for Money</label>
              <select
                value={formData.value_for_money}
                onChange={(e) => setFormData({...formData, value_for_money: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {[5,4,3,2,1].map(n => (
                  <option key={n} value={n}>{n} Stars</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Your Review</label>
            <textarea
              rows="4"
              required
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Share your experience..."
              value={formData.comment}
              onChange={(e) => setFormData({...formData, comment: e.target.value})}
            />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Submit Review
            </button>
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📝</div>
            <p>No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b pb-4 last:border-b-0">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg flex-shrink-0">
                  {review.user_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold">{review.user_name}</div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        {renderStars(review.rating)}
                        <span>• {new Date(review.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-2">{review.comment}</p>
                  {review.start_date && (
                    <div className="text-sm text-gray-500">
                      Stayed: {new Date(review.start_date).toLocaleDateString()} - 
                      {review.end_date ? new Date(review.end_date).toLocaleDateString() : 'Present'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSection;