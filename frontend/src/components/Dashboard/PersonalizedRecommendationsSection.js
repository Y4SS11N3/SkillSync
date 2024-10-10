import React from 'react';
import { useDispatch } from 'react-redux';
import { addToLearningGoals } from '../../redux/actions/dashboardActions';
import SkillBadge from '../skills/SkillBadge';
import Loader from '../common/Loader';

const PersonalizedRecommendationsSection = ({ recommendations, loading, error }) => {
  const dispatch = useDispatch();

  const handleRecommendationAction = (recommendation) => {
    dispatch(addToLearningGoals(recommendation.id));
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Personalized Recommendations</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map(recommendation => (
          <div key={recommendation.id} className={`bg-gray-100 dark:bg-gray-700 rounded-lg p-4 ${recommendation.isUserInterest ? 'border-2 border-blue-500' : ''}`}>
            <div className="font-semibold mb-2">{recommendation.name}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{recommendation.description}</p>
            <div className="flex justify-between items-center">
              <SkillBadge name={recommendation.category} />
              {recommendation.isUserInterest ? (
                <span className="text-green-500 font-semibold">Your Interest</span>
              ) : (
                <button
                  onClick={() => handleRecommendationAction(recommendation)}
                  className="bg-blue-500 text-white py-1 px-3 rounded text-sm hover:bg-blue-600 transition duration-300"
                >
                  Add to Learning Goals
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonalizedRecommendationsSection;