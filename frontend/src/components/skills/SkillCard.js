import React from 'react';
import { motion } from 'framer-motion';
import { TrashIcon, AcademicCapIcon, ClockIcon, CalendarIcon, FireIcon, UserGroupIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

const SkillCard = ({ skill, onDelete, onSelect, isTrending }) => (
  <motion.div
    className={`rounded-xl shadow-lg p-6 relative overflow-hidden ${
      isTrending 
        ? 'bg-white dark:bg-gray-800'
        : 'bg-white dark:bg-gray-800'
    }`}
    whileHover={{ y: -5, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
    transition={{ type: 'spring', stiffness: 300 }}
    onClick={() => onSelect(skill)}
  >
    <div className={`absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl rounded-bl-full ${
      isTrending 
        ? 'from-red-200 to-transparent dark:from-red-800' 
        : 'from-blue-100 to-transparent dark:from-blue-900'
    }`}></div>
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white">{skill.name}</h3>
      {!isTrending && (
        <div className="flex space-x-2 z-10">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); onDelete(skill.id); }}
            className="p-2 rounded-full bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition duration-300"
          >
            <TrashIcon className="h-5 w-5" />
          </motion.button>
        </div>
      )}
      {isTrending && (
        <FireIcon className="h-6 w-6 text-orange-500 dark:text-orange-400" />
      )}
    </div>
    <p className="text-gray-600 dark:text-gray-400 mb-4">{skill.description || 'No description available.'}</p>
    
    {isTrending ? (
      <>
        <div className="flex items-center mb-2">
          <UserGroupIcon className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {skill.userCount || 'Unknown'} users have this skill
          </span>
        </div>
        <div className="flex items-center mb-2">
          <ArrowTrendingUpIcon className="h-5 w-5 text-green-500 dark:text-green-400 mr-2" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {skill.growthRate || 'Unknown'}% growth this month
          </span>
        </div>
      </>
    ) : (
      <>
        <div className="flex items-center mb-2">
          <AcademicCapIcon className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Level: {getProficiencyLabel(skill.proficiencyLevel)}
          </span>
        </div>
        <div className="flex items-center mb-2">
          <ClockIcon className="h-5 w-5 text-green-500 dark:text-green-400 mr-2" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Time Credit: {skill.timeCredit || 'Not specified'} hours
          </span>
        </div>
        <div className="flex items-center">
          <CalendarIcon className="h-5 w-5 text-purple-500 dark:text-purple-400 mr-2" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Added: {skill.createdAt ? new Date(skill.createdAt).toLocaleDateString() : 'Unknown'}
          </span>
        </div>
      </>
    )}
  </motion.div>
);

const getProficiencyLabel = (level) => {
  const labels = ['Good', 'Skilled', 'Experienced', 'Advanced', 'Expert'];
  return labels[level - 1] || 'Not specified';
};

export default SkillCard;