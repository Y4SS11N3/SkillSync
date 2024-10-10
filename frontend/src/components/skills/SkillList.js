import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, ChevronLeftIcon, ChevronRightIcon, FireIcon } from '@heroicons/react/24/outline';
import { fetchUserSkills, searchSkills, setSelectedSkill, getSkillTrends } from '../../redux/actions/skillActions';
import SkillCard from './SkillCard';
import Loader from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';
import Select from '../common/Select';
import { getTrendingSkills } from '../../redux/actions/skillActions';
import { deleteUserSkill } from '../../redux/actions/skillActions';

const SkillList = ({ onEditSkill, onDeleteSkill, onSelectSkill }) => {
  const dispatch = useDispatch();
  const { skills, trendingSkills, loading, error } = useSelector(state => state.skills);
  console.log('Skills prop in SkillList:', skills);
  console.log('Skills from Redux:', skills);
  console.log('Trending skills from Redux:', trendingSkills);
  const user = useSelector(state => state.auth.user);
  console.log('User:', user);
  console.log('Skills from Redux:', skills);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    level: 'all',
    timeCredit: 'all',
    sortBy: 'name'
  });
  const [showTrending, setShowTrending] = useState(false);
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserSkills(user.id));
      // Only fetch trending skills when needed
      if (showTrending) {
        dispatch(getTrendingSkills());
      }
    }
  }, [dispatch, user, showTrending]);

  useEffect(() => {
    if (searchTerm) {
      dispatch(searchSkills(user?.id, searchTerm));
    }
  }, [dispatch, user, searchTerm]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const handleScroll = () => {
        setShowLeftArrow(container.scrollLeft > 0);
        setShowRightArrow(container.scrollLeft < container.scrollWidth - container.clientWidth);
      };
      container.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial check
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [skills, trendingSkills, showTrending]);

  const handleSkillSelect = (skill) => {
    dispatch(setSelectedSkill(skill));
    onSelectSkill(skill);
    console.log('Selected skill:', skill);
  };
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prevFilters => ({ ...prevFilters, [filterName]: value }));
  };

  console.log('SkillList render - props:', { skills: skills.length, trendingSkills: trendingSkills.length, showTrending });

  const restructureSkillData = (skill) => {
    if (!skill || typeof skill !== 'object') {
      console.log('Invalid skill object:', skill);
      return null;
    }
    return {
      ...skill,
      description: skill.UserSkill?.description || skill.description || 'No description available.',
      proficiencyLevel: skill.UserSkill?.proficiencyLevel || skill.proficiencyLevel,
      isInterested: skill.UserSkill?.isInterested || false
    };
  };

  const filteredSkills = useCallback(() => {
    console.log('Skills in filteredSkills:', skills);
    console.log('filteredSkills - trendingSkills:', trendingSkills);
    const skillsToFilter = showTrending ? trendingSkills : skills;
    console.log('filteredSkills - skillsToFilter:', skillsToFilter);
    if (!skillsToFilter) return [];
  
    const filtered = skillsToFilter
      .map(restructureSkillData)
      .filter((skill) => {
        if (!skill) return false;
        return (
          !skill.isInterested &&
          skill.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          (filters.category === 'all' || skill.category === filters.category) &&
          (filters.level === 'all' || skill.proficiencyLevel === parseInt(filters.level)) &&
          (filters.timeCredit === 'all' || (skill.timeCredit && skill.timeCredit <= parseInt(filters.timeCredit)))
        );
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'proficiency':
            return b.proficiencyLevel - a.proficiencyLevel;
          case 'recentlyUpdated':
            return new Date(b.updatedAt) - new Date(a.updatedAt);
          default:
            return 0;
        }
      });
    console.log('filteredSkills - result:', filtered);
    return filtered;
  }, [skills, trendingSkills, showTrending, searchTerm, filters]);


  useEffect(() => {
    console.log('SkillList useEffect - showTrending changed:', showTrending);
  }, [showTrending]);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleDeleteSkill = (skillId) => {
    dispatch(deleteUserSkill(skillId))
      .then(() => {
        console.log('Skill deleted successfully');
        dispatch(fetchUserSkills(user.id));
      })
      .catch((error) => {
        console.error('Error deleting skill:', error);
      });
  };

  const skillVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;

  const skillsToRender = filteredSkills();
  console.log('skillsToRender:', skillsToRender);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search for skills..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <div className="flex items-center space-x-2">
          <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-400" />
          <Select
            options={[
              { value: 'all', label: 'All Categories' },
              { value: 'technology', label: 'Technology' },
              { value: 'design', label: 'Design' },
              { value: 'business', label: 'Business' },
              { value: 'language', label: 'Language' },
            ]}
            value={filters.category}
            onChange={(value) => handleFilterChange('category', value)}
            className="w-40"
          />
          <Select
            options={[
              { value: 'all', label: 'All Levels' },
              { value: '1', label: 'Beginner' },
              { value: '5', label: 'Intermediate' },
              { value: '8', label: 'Advanced' },
            ]}
            value={filters.level}
            onChange={(value) => handleFilterChange('level', value)}
            className="w-40"
          />
          <Select
            options={[
              { value: 'all', label: 'Any Time Credit' },
              { value: '1', label: '1 hour or less' },
              { value: '2', label: '2 hours or less' },
              { value: '5', label: '5 hours or less' },
            ]}
            value={filters.timeCredit}
            onChange={(value) => handleFilterChange('timeCredit', value)}
            className="w-40"
          />
          <Select
            options={[
              { value: 'name', label: 'Sort by Name' },
              { value: 'proficiency', label: 'Sort by Proficiency' },
              { value: 'recentlyUpdated', label: 'Sort by Recently Updated' },
            ]}
            value={filters.sortBy}
            onChange={(value) => handleFilterChange('sortBy', value)}
            className="w-48"
          />
        </div>
        <button
        onClick={() => {
          console.log('Toggling showTrending');
          setShowTrending(!showTrending);
        }}
        className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition duration-300 ${
          showTrending
            ? 'bg-orange-500 text-white hover:bg-orange-600'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        <FireIcon className="h-5 w-5 mr-2" />
        {showTrending ? 'Show My Skills' : 'Show Trending'}
      </button>
      </div>

      {skillsToRender.length === 0 ? (
        <div className="text-center text-gray-500 p-4 bg-gray-100 rounded-lg">
          {showTrending
            ? 'No trending skills available at the moment.'
            : searchTerm || filters.category !== 'all' || filters.level !== 'all' || filters.timeCredit !== 'all'
            ? 'No skills match your search or filters.'
            : 'No skills found. Add some skills to get started!'}
        </div>
      ) : (
        <div className="relative">
          <div 
            ref={scrollContainerRef} 
            className="flex custom-scrollbar overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4"
          >
            <AnimatePresence>
              {skillsToRender.map((skill) => (
                <motion.div
                  key={skill.id}
                  variants={skillVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  layout
                  className="flex-none w-72 sm:w-80 md:w-96 p-4 snap-start"
                >
<SkillCard 
  skill={skill} 
  onSelect={() => handleSkillSelect(skill)}
  onDelete={showTrending ? null : () => handleDeleteSkill(skill.id)}
  isTrending={showTrending}
/>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg z-10"
            >
              <ChevronLeftIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </button>
          )}
          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg z-10"
            >
              <ChevronRightIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SkillList;