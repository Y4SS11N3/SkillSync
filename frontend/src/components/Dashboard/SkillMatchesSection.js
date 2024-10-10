import React from 'react';
import { UserCircleIcon, AcademicCapIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Loader from '../common/Loader';

const SkillMatchesSection = ({ loading, matches }) => {
  if (loading) return <Loader />;
  if (!matches || matches.length === 0) return null;

  const handleInitiateExchange = (match) => {
    console.log('Initiating exchange with:', match);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">Skill Matches</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map(match => (
          <div key={match.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 transition duration-300 ease-in-out hover:shadow-lg">
            <div className="flex items-center mb-4">
              {match.avatar ? (
                <img src={match.avatar} alt={match.name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <UserCircleIcon className="w-12 h-12 text-gray-400" />
              )}
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{match.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{match.title}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <AcademicCapIcon className="w-5 h-5 mr-2 text-blue-500" />
                Skills
              </div>
              <div className="flex flex-wrap">
                {match.skills && match.skills.map(skill => (
                  <span key={skill} className="px-2 py-1 m-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            
            <button
              onClick={() => handleInitiateExchange(match)}
              className="w-full flex items-center justify-center bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Initiate Exchange
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillMatchesSection;