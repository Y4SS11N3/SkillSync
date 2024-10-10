import React from 'react';
import { TrophyIcon } from '@heroicons/react/24/outline';
import Loader from '../common/Loader';

const AchievementsSection = ({ loading, achievements }) => {
  if (loading) return <Loader />;
  if (!achievements || achievements.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Achievements</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {achievements.map(achievement => (
          <div key={achievement.id} className="text-center">
            <div className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center ${achievement.unlocked ? 'bg-yellow-400' : 'bg-gray-300'}`}>
              {achievement.icon ? 
                <achievement.icon className={`w-10 h-10 ${achievement.unlocked ? 'text-white' : 'text-gray-500'}`} /> :
                <TrophyIcon className={`w-10 h-10 ${achievement.unlocked ? 'text-white' : 'text-gray-500'}`} />
              }
            </div>
            <div className="font-medium">{achievement.name}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementsSection;