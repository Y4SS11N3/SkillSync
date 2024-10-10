import React from 'react';
import { motion } from 'framer-motion';

const FilterSection = ({ filters, setFilters }) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
    >
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
        <select
          id="category"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="w-full p-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300"
        >
          <option value="all">All Categories</option>
          <option value="Programming">Programming</option>
          <option value="Design">Design</option>
          <option value="Marketing">Marketing</option>
          <option value="Languages">Languages</option>
          <option value="Data Science">Data Science</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div>
        <label htmlFor="level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Level</label>
        <select
          id="level"
          value={filters.level}
          onChange={(e) => setFilters({ ...filters, level: e.target.value })}
          className="w-full p-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300"
        >
          <option value="all">All Levels</option>
          <option value="1">Beginner</option>
          <option value="3">Intermediate</option>
          <option value="5">Advanced</option>
        </select>
      </div>
      <div>
        <label htmlFor="timeCredit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time Credit</label>
        <select
          id="timeCredit"
          value={filters.timeCredit}
          onChange={(e) => setFilters({ ...filters, timeCredit: e.target.value })}
          className="w-full p-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300"
        >
          <option value="all">Any Time Credit</option>
          <option value="1">1 hour or less</option>
          <option value="2">2 hours or less</option>
          <option value="5">5 hours or less</option>
        </select>
      </div>
    </motion.div>
  );
};

export default FilterSection;