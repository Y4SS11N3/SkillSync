import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import debounce from 'lodash/debounce';
import { 
  PlusIcon,
  ArrowPathRoundedSquareIcon
} from '@heroicons/react/24/outline';

// Component imports
import Header from '../components/Header/AuthenticatedHeader';
import Modal from '../components/common/Modal';
import Toast from '../components/common/Toast';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import DatePicker from '../components/common/DatePicker';
import SkillOverview from '../components/skills/SkillOverview';
import SkillDistribution from '../components/skills/SkillDistribution';
import SkillProgressChart from '../components/skills/SkillProgressChart';
import SkillForm from '../components/skills/SkillForm';
import SkillList from '../components/skills/SkillList';

// Redux action imports
import { 
  fetchUserSkills, 
  setSkills,
  searchSkills
} from '../redux/actions/skillActions';

// Service imports
import skillService from '../services/skillService';

/**
 * MySkills component for managing user skills
 * @returns {JSX.Element} The MySkills page component
 */
const MySkills = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const componentRef = useRef(null);

  // Redux state
  const { isAuthenticated, loading: authLoading, user } = useSelector(state => state.auth);
  const { skills, loading, error, statistics, trends } = useSelector(state => state.skills);

  // Local state
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [shouldFetchTrends, setShouldFetchTrends] = useState(false);
  const [trendingSkills, setTrendingSkills] = useState([]);
  const [activeSection, setActiveSection] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [dateRange, setDateRange] = useState({ 
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)), 
    end: new Date() 
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    proficiencyLevel: 'all',
    sortBy: 'name'
  });

  // Effects
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      dispatch(fetchUserSkills(user.id));
    }
  }, [isAuthenticated, user, dispatch]);

  useEffect(() => {
    console.log('User:', user);
    console.log('Selected Skill:', selectedSkill);
    console.log('User latitude:', user?.latitude);
    console.log('User longitude:', user?.longitude);
  }, [user, selectedSkill]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (componentRef.current && !componentRef.current.contains(event.target)) {
        setSelectedSkill(null);
      }
    };

    document.addEventListener('click', handleOutsideClick);

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  // React Query hooks
  const { data: userSkills, isLoading: userSkillsLoading } = useQuery(
    ['userSkills', user?.id],
    () => skillService.getUserSkills(user?.id),
    {
      enabled: !!user?.id,
      onSuccess: (data) => {
        dispatch(setSkills(data));
      },
      staleTime: 300000,
      cacheTime: 3600000,
    }
  );

  const { data: availableSkills, isLoading: availableSkillsLoading } = useQuery(
    'availableSkills',
    () => skillService.listSkills(),
    {
      staleTime: 600000,
      cacheTime: 3600000,
      onSuccess: (data) => {
        console.log('Available skills fetched:', data);
      },
      onError: (error) => {
        console.error('Error fetching available skills:', error);
      }
    }
  );

  const { data: trendingSkillsData, isLoading: trendingSkillsLoading } = useQuery(
    'trendingSkills',
    () => {
      console.log('Fetching trending skills...');
      return skillService.getTrendingSkills();
    },
    {
      enabled: shouldFetchTrends,
      onSuccess: (data) => {
        console.log('Trending skills fetched successfully:', data);
        setTrendingSkills(data);
        setShouldFetchTrends(false);
      },
      onError: (error) => {
        console.error('Error fetching trending skills:', error);
      },
      staleTime: 300000,
      cacheTime: 3600000,
    }
  );

  const { data: skillStats, isLoading: statsLoading, error: statsError } = useQuery(
    ['skillStatistics', selectedSkill?.id],
    () => skillService.getSkillStatistics(user?.id, selectedSkill?.id),
    {
      enabled: !!selectedSkill?.id && !!user?.id,
      onSuccess: (data) => {
        if (data === null) {
          console.log(`No statistics available for skill ${selectedSkill?.id}`);
        } else {
          console.log('Skill statistics:', data);
        }
      },
      onError: (error) => {
        console.error('Error fetching skill statistics:', error);
      }
    }
  );

  // Mutations
  const addSkillMutation = useMutation(
    (skillData) => skillService.addUserSkill(user.id, skillData),
    {
      onSuccess: (newSkill) => {
        queryClient.invalidateQueries('userSkills');
        setToastMessage('Skill added successfully');
        setToastType('success');
        setShowToast(true);
      },
      onError: (error) => {
        setToastMessage(error.message || 'Failed to add skill');
        setToastType('error');
        setShowToast(true);
      }
    }
  );

  const updateSkillMutation = useMutation(
    ({ skillId, skillData }) => skillService.updateUserSkill(user.id, skillId, skillData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('userSkills');
        setToastMessage('Skill updated successfully');
        setToastType('success');
        setShowToast(true);
      },
      onError: (error) => {
        setToastMessage(error.message || 'Failed to update skill');
        setToastType('error');
        setShowToast(true);
      }
    }
  );
  
  const deleteSkillMutation = useMutation(
    (skillId) => skillService.deleteSkill(skillId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('userSkills');
        setToastMessage('Skill deleted successfully');
        setToastType('success');
        setShowToast(true);
      },
      onError: (error) => {
        setToastMessage(error.message || 'Failed to delete skill');
        setToastType('error');
        setShowToast(true);
      }
    }
  );

  // Memoized values
  const formattedAvailableSkills = React.useMemo(() => {
    if (Array.isArray(availableSkills?.skills)) {
      return availableSkills.skills.map(skill => ({
        id: skill.id,
        name: skill.name
      }));
    }
    return [];
  }, [availableSkills]);

  const filteredSkills = useCallback(() => {
    if (!userSkills) return [];
    
    return userSkills.filter(skill => {
      const nameMatch = skill.name.toLowerCase().includes(searchTerm.toLowerCase());
      const categoryMatch = filters.category === 'all' || skill.category === filters.category;
      const proficiencyMatch = filters.proficiencyLevel === 'all' || skill.proficiencyLevel === parseInt(filters.proficiencyLevel);
      
      return nameMatch && categoryMatch && proficiencyMatch;
    }).sort((a, b) => {
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
  }, [userSkills, searchTerm, filters]);

  // Handlers
  const handleAddSkill = useCallback(() => {
    setEditingSkill(null);
    setShowModal(true);
    console.log('Opening add skill modal, available skills:', formattedAvailableSkills);
  }, [formattedAvailableSkills]);

  const handleEditSkill = useCallback((skill) => {
    console.log('Opening edit skill modal...', skill);
    setEditingSkill(skill);
    setShowModal(true);
  }, []);

  const handleUpdateSkill = useCallback((skillId, skillData) => {
    updateSkillMutation.mutate({ skillId, skillData });
  }, [updateSkillMutation]);

  const handleDeleteSkill = useCallback(async (skillId) => {
    console.log('Deleting skill...', skillId);
    try {
      await deleteSkillMutation.mutateAsync(skillId);
    } catch (error) {
      console.error('Error deleting skill:', error);
      setToastMessage('Failed to delete skill');
      setToastType('error');
      setShowToast(true);
    }
  }, [deleteSkillMutation, setToastMessage, setToastType, setShowToast]);

  const handleSubmitSkill = useCallback((skillData) => {
    console.log('Submitting skill...', skillData);
    if (!user?.id) {
      console.error('User not authenticated');
      setToastMessage('User not authenticated. Please log in.');
      setToastType('error');
      setShowToast(true);
      return;
    }
  
    if (!skillData.skillId || !skillData.proficiencyLevel) {
      console.error('Missing required skill data');
      setToastMessage('Please fill in all required fields.');
      setToastType('error');
      setShowToast(true);
      return;
    }
  
    if (editingSkill) {
      updateSkillMutation.mutate({ skillId: editingSkill.id, skillData });
    } else {
      addSkillMutation.mutate(skillData);
    }
    setShowModal(false);
  }, [user, editingSkill, updateSkillMutation, addSkillMutation, setToastMessage, setToastType, setShowToast]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setShouldFetchTrends(true);
    Promise.all([
      queryClient.invalidateQueries('userSkills'),
      queryClient.invalidateQueries('skillStatistics'),
      queryClient.invalidateQueries('skillTrends')
    ]).then(() => {
      setToastMessage('Data refreshed successfully');
      setToastType('success');
      setShowToast(true);
    }).catch(() => {
      setToastMessage('Failed to refresh data');
      setToastType('error');
      setShowToast(true);
    }).finally(() => {
      setIsRefreshing(false);
    });
  }, [queryClient]);

  const debouncedSearch = useCallback(
    debounce((term) => {
      dispatch(searchSkills(user?.id, term));
    }, 300),
    [dispatch, user?.id]
  );
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prevFilters => ({ ...prevFilters, [filterName]: value }));
  };

  const handleSelectSkill = useCallback((skill, event) => {
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }
    setSelectedSkill(prevSkill => prevSkill?.id === skill.id ? null : skill);
    console.log('Selected skill in MySkills:', skill);
  }, []);

  // Render logic
  if (authLoading) {
    return <Loader />;
  }
  
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }
  
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex-1 overflow-auto">
        <Header 
          user={user}
          onNotificationClick={() => {/* Handle notification click */}}
          onSettingsClick={() => {/* Handle settings click */}}
        />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Skills</h1>
            <div className="flex items-center space-x-4">
              <DatePicker
                startDate={dateRange.start}
                endDate={dateRange.end}
                onChange={({ startDate, endDate }) => setDateRange({ start: startDate, end: endDate })}
              />
              <button
                onClick={handleRefresh}
                className={`bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition duration-300 ${isRefreshing ? 'animate-spin' : ''}`}
                disabled={isRefreshing}
              >
                <ArrowPathRoundedSquareIcon className="w-5 h-5" />
              </button>
              <button
                onClick={handleAddSkill}
                className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Skill
              </button>
            </div>
          </div>

          {error && <ErrorMessage message={error} />}

          {userSkillsLoading || trendingSkillsLoading ? (
            <Loader />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : (
            <>
              <SkillOverview skillStats={skillStats} />
              <SkillList 
                skills={userSkills || []}
                trendingSkills={trendingSkills}
                onEditSkill={handleEditSkill} 
                onDeleteSkill={handleDeleteSkill} 
                onSelectSkill={(skill, event) => handleSelectSkill(skill, event)}
              />
              {userSkills && userSkills.length > 0 && (
                <>
                  <SkillDistribution userSkills={userSkills} />
                  <SkillProgressChart userSkills={userSkills} />
                </>
              )}
            </>
          )}

          <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              {editingSkill ? 'Edit Skill' : 'Add New Skill'}
            </h2>
            {availableSkillsLoading ? (
              <p>Loading available skills...</p>
            ) : (
              <SkillForm 
                skill={editingSkill} 
                onSubmit={handleSubmitSkill} 
                onCancel={() => setShowModal(false)}
                availableSkills={formattedAvailableSkills}
              />
            )}
          </Modal>

          <Toast
            show={showToast}
            message={toastMessage}
            type={toastType}
            onClose={() => setShowToast(false)}
          />
        </main>
      </div>
    </div>
  );
};

export default MySkills;