import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import { getTrendingSkills } from '../../redux/actions/skillActions';

const TrendingSkills = () => {
  const dispatch = useDispatch();
  const { trendingSkills, loading, error } = useSelector(state => state.skills);

  useEffect(() => {
    dispatch(getTrendingSkills());
  }, [dispatch]);

  console.log('Trending skills data:', trendingSkills);

  if (loading) return <div>Loading trending skills...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!trendingSkills || trendingSkills.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
          <ChartBarIcon className="h-6 w-6 mr-2 text-blue-500" />
          Trending Skills
        </h3>
        <p>No trending skills data available.</p>
      </div>
    );
  }

  const maxTrendScore = Math.max(...trendingSkills.map(skill => skill.trendScore));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
        <ChartBarIcon className="h-6 w-6 mr-2 text-blue-500" />
        Trending Skills
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trendingSkills.map((skill, index) => (
          <div key={skill.id} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-800 dark:text-white">
                {skill.name}
              </span>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                #{index + 1}
              </span>
            </div>
            <div className="mt-2">
              <div className="bg-blue-200 dark:bg-blue-900 rounded-full h-2">
                <div 
                  className="bg-blue-500 rounded-full h-2" 
                  style={{ width: `${(skill.trendScore / maxTrendScore) * 100}%` }}
                ></div>
              </div>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Trend Score: {skill.trendScore}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-4">
              Exchanges: {skill.exchangeCount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingSkills;