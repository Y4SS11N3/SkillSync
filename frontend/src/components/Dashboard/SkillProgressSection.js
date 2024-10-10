import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, GitBranch, Star } from 'lucide-react';
import ProgressBar from '../common/ProgressBar';
import Loader from '../common/Loader';

const SkillCard = ({ skill }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getProficiencyLabel = (level) => {
    const labels = ['Good', 'Skilled', 'Experienced', 'Advanced', 'Expert'];
    return labels[level - 1] || 'Unknown';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">{skill.name || 'Unnamed Skill'}</span>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 mr-1" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {skill.proficiencyLevel || 'N/A'} - {getProficiencyLabel(skill.proficiencyLevel)}
            </span>
          </div>
        </div>
        <ProgressBar progress={skill.progress || 0} />
        <div className="flex justify-between mt-3 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center">
            <GitBranch className="w-4 h-4 mr-1" />
            <span>{skill.totalExchanges || 0} exchanges</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>Last: {skill.lastExchangeDate ? new Date(skill.lastExchangeDate).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>
      </div>
      <div 
        className="bg-gray-100 dark:bg-gray-700 px-4 py-2 cursor-pointer flex justify-between items-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {isExpanded ? 'Hide Details' : 'Show Details'}
        </span>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </div>
      {isExpanded && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Category: {skill.category || 'N/A'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Proficiency Level: {skill.proficiencyLevel} - {getProficiencyLabel(skill.proficiencyLevel)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Progress: {skill.progress}%
          </p>
        </div>
      )}
    </div>
  );
};

const SkillProgressSection = ({ loading, skills }) => {
  if (loading) return <Loader />;
  if (!skills || skills.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">Skill Progress</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {skills.map(skill => (
          <SkillCard key={skill.id} skill={skill} />
        ))}
      </div>
    </div>
  );
};

export default SkillProgressSection;