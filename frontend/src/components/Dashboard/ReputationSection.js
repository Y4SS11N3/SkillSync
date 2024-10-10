import React, { useEffect, useState } from 'react';
import { Star, ChevronDown } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { getUserReputation } from '../../redux/actions/dashboardActions';

const StarRating = ({ rating }) => {
  const getStarPercentage = (starIndex) => {
    const percentage = Math.max(0, Math.min(100, (rating - starIndex + 1) * 100));
    return `${percentage}%`;
  };

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <div key={star} className="relative w-5 h-5">
          <Star
            className="w-5 h-5 text-gray-300 absolute"
            fill="currentColor"
          />
          <div className="absolute top-0 left-0 overflow-hidden" style={{ width: getStarPercentage(star) }}>
            <Star
              className="w-5 h-5 text-yellow-400"
              fill="currentColor"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const ReputationSection = () => {
  const dispatch = useDispatch();
  const { loading, userReputation, userReviews } = useSelector(state => state.dashboard);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    dispatch(getUserReputation());
  }, [dispatch]);

  if (loading.userReputation) return <ReputationSkeleton />;

  const { reputation, totalReviews, userRanking, topPercentage } = userReputation || {};

  if (!reputation || typeof reputation !== 'number') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Your Reputation</h2>
        <p>No reputation data available yet. Start exchanging skills to build your reputation!</p>
      </div>
    );
  }

  const safeUserReviews = Array.isArray(userReviews) ? userReviews : [];
  const visibleReviews = showAllReviews ? safeUserReviews : safeUserReviews.slice(0, 2);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6">Your Reputation</h2>
      <div className="flex flex-col md:flex-row items-center justify-between mb-8">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="text-5xl font-bold mr-6 text-indigo-600">{reputation.toFixed(1)}</div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </div>
            <StarRating rating={reputation} />
          </div>
        </div>
        <div className="text-center md:text-right">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ranking</div>
          <div className="text-3xl font-semibold text-indigo-600">#{userRanking}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Top {topPercentage}%</div>
        </div>
      </div>
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Recent Reviews</h3>
        {safeUserReviews.length > 0 ? (
          <>
            <ul className="space-y-4">
              {visibleReviews.map((review, index) => (
                <ReviewItem key={index} review={review} />
              ))}
            </ul>
            {safeUserReviews.length > 2 && (
              <button
                className="mt-4 w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                onClick={() => setShowAllReviews(!showAllReviews)}
              >
                {showAllReviews ? 'Show Less' : 'Show More'}
                <ChevronDown className={`inline-block ml-2 h-4 w-4 transition-transform ${showAllReviews ? 'rotate-180' : ''}`} />
              </button>
            )}
          </>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">No reviews yet.</p>
        )}
      </div>
    </div>
  );
};

const ReviewItem = ({ review }) => (
  <li className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center">
        <StarRating rating={review.rating} />
        <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">{review.rating.toFixed(1)}</span>
      </div>
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {new Date(review.date).toLocaleDateString()}
      </span>
    </div>
    <p className="text-gray-700 dark:text-gray-300 mb-2">{review.comment}</p>
    <p className="text-sm text-indigo-600 dark:text-indigo-400">By {review.reviewerName}</p>
  </li>
);

const ReputationSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 animate-pulse">
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
    <div className="flex flex-col md:flex-row items-center justify-between mb-8">
      <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4 md:mb-0"></div>
      <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
    </div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mt-8 mb-4"></div>
    <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
    <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
  </div>
);

export default ReputationSection;