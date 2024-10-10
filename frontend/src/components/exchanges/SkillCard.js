import React from 'react';
import { FaStar, FaUser, FaExchangeAlt } from 'react-icons/fa';

const SkillCard = ({ skill, matchPercentage, provider, onSelect }) => {
  const getLevelColor = (level) => {
    const colors = [
      'from-green-400 to-green-600',
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-red-400 to-red-600',
      'from-yellow-400 to-yellow-600'
    ];
    return colors[level - 1] || colors[0];
  };
  
  const getMatchColor = (percentage) => {
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div onClick={onSelect} className="relative bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl border border-gray-200 flex flex-col h-full cursor-pointer transform hover:-translate-y-1">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${getLevelColor(skill.proficiencyLevel)} rounded-bl-full`}>
        <span className="absolute top-4 right-4 text-white text-sm font-bold">
          Level {skill.proficiencyLevel}
        </span>
      </div>
      
      <div className="p-6 flex-grow space-y-4">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{skill.name}</h3>
        
        {skill.description && (
          <p className="text-gray-600 text-sm">{skill.description}</p>
        )}
        
        <div className="flex flex-col space-y-3 mt-4">
          {provider && (
            <div className="flex items-center space-x-2">
              <div className="bg-blue-100 rounded-full p-2">
                <FaUser className="text-blue-500 w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-gray-700">{provider.name}</span>
            </div>
          )}
          {matchPercentage !== undefined && (
            <div className={`flex items-center space-x-2`}>
              <div className={`bg-${getMatchColor(matchPercentage).split('-')[1]}-100 rounded-full p-2`}>
                <FaExchangeAlt className={`${getMatchColor(matchPercentage)} w-4 h-4`} />
              </div>
              <span className={`text-sm font-bold ${getMatchColor(matchPercentage)}`}>{matchPercentage}% Match</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-xs font-semibold text-gray-700">
          {skill.category}
        </span>
        <button className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold py-2 px-4 rounded-full transition-colors duration-300">
          Connect
        </button>
      </div>
    </div>
  );
};

export default SkillCard;