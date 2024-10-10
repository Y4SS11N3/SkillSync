import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// Component imports
import DashboardHeader from '../components/Header/AuthenticatedHeader';
import OverviewSection from '../components/Dashboard/OverviewSection';
import SkillProgressSection from '../components/Dashboard/SkillProgressSection';
import ExchangeHistorySection from '../components/Dashboard/ExchangeHistorySection';
import ReputationSection from '../components/Dashboard/ReputationSection';
import SkillMatchesSection from '../components/Dashboard/SkillMatchesSection';
import UpcomingExchangesSection from '../components/Dashboard/UpcomingExchangesSection';
import PersonalizedRecommendationsSection from '../components/Dashboard/PersonalizedRecommendationsSection';
import AchievementsSection from '../components/Dashboard/AchievementsSection';
import LearningGoalsSection from '../components/Dashboard/LearningGoalsSection';
import FilterModal from '../components/Dashboard/FilterModal';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import Modal from '../components/common/Modal';
import Toast from '../components/common/Toast';

// Action imports
import { loadUser } from '../redux/actions/authActions';
import {
  getDashboardData,
  getUserSkills,
  getExchangeHistory,
  getUserReputation,
  getSkillMatches,
  getUpcomingExchanges,
  getPersonalizedRecommendations,
  getAchievements,
  getLearningGoals,
  addToLearningGoals
} from '../redux/actions/dashboardActions';

/**
 * Dashboard component for displaying user's dashboard information
 * @returns {JSX.Element} The Dashboard page component
 */
const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state
  const { isAuthenticated, loading: authLoading, user } = useSelector(state => state.auth);
  const dashboardState = useSelector(state => state.dashboard);

  // Local state
  const [dateRange, setDateRange] = useState({ 
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)), 
    end: new Date() 
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    skillLevel: 'all',
    exchangeStatus: 'all',
    sortBy: 'date'
  });

  // Effects
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      dispatch(loadUser());
    } else if (isAuthenticated && !authLoading) {
      fetchDashboardData();
    }
  }, [isAuthenticated, authLoading, dispatch, dateRange]);

  // Memoized values
  const dashboardData = useMemo(() => ({
    dashboardData: dashboardState.dashboardData || {},
    userSkills: dashboardState.userSkills || [],
    exchangeHistory: dashboardState.exchangeHistory || [],
    userReputation: dashboardState.userReputation || {},
    skillMatches: dashboardState.skillMatches || [],
    upcomingExchanges: dashboardState.upcomingExchanges || [],
    personalizedRecommendations: dashboardState.personalizedRecommendations || [],
    achievements: dashboardState.achievements || [],
    learningGoals: dashboardState.learningGoals || [],
    loading: dashboardState.loading || {},
    error: dashboardState.error || {}
  }), [dashboardState]);

  // Callbacks
  const fetchDashboardData = useCallback(async () => {
    try {
      await Promise.all([
        dispatch(getDashboardData(dateRange)),
        dispatch(getUserSkills()),
        dispatch(getExchangeHistory()),
        dispatch(getUserReputation()),
        dispatch(getSkillMatches()),
        dispatch(getUpcomingExchanges()),
        dispatch(getPersonalizedRecommendations()),
        dispatch(getAchievements()),
        dispatch(getLearningGoals())
      ]);
    } catch (error) {
      setToastMessage('Some dashboard data could not be loaded. Please try refreshing.');
      setToastType('error');
      setShowToast(true);
    }
  }, [dispatch, dateRange]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchDashboardData()
      .then(() => {
        setToastMessage('Dashboard data refreshed successfully');
        setToastType('success');
        setShowToast(true);
      })
      .catch(() => {
        setToastMessage('Failed to refresh some dashboard data. Please try again.');
        setToastType('error');
        setShowToast(true);
      })
      .finally(() => {
        setIsRefreshing(false);
      });
  }, [fetchDashboardData]);

  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prevFilters => ({ ...prevFilters, [filterName]: value }));
  }, []);

  const handleAddToLearningGoals = useCallback((goalData) => {
    dispatch(addToLearningGoals(goalData))
      .then(() => {
        setToastMessage('Learning goal added successfully');
        setToastType('success');
        setShowToast(true);
        dispatch(getLearningGoals());
      })
      .catch((error) => {
        setToastMessage('Failed to add learning goal. Please try again.');
        setToastType('error');
        setShowToast(true);
      });
  }, [dispatch]);

  // Helper function to safely render components
  const renderSection = useCallback((Component, props, sectionName) => {
    if (dashboardData.error[sectionName.toLowerCase()]) {
      return <ErrorMessage message={`Failed to load ${sectionName}: ${dashboardData.error[sectionName.toLowerCase()]}`} />;
    }
    try {
      return <Component {...props} />;
    } catch (err) {
      return <ErrorMessage message={`An error occurred while rendering ${sectionName}. Please try refreshing the page.`} />;
    }
  }, [dashboardData.error]);

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
        <DashboardHeader 
          user={user}
          onNotificationClick={() => setShowNotifications(true)}
          onSettingsClick={() => setShowSettings(true)}
          dateRange={dateRange}
          setDateRange={setDateRange}
          handleRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
        <main className="container mx-auto px-4 py-8">
          {renderSection(OverviewSection, { loading: dashboardData.loading.dashboardData, data: dashboardData.dashboardData }, 'OverviewSection')}
          {renderSection(SkillProgressSection, { loading: dashboardData.loading.userSkills, skills: dashboardData.userSkills }, 'SkillProgressSection')}
          {renderSection(ExchangeHistorySection, { 
            loading: dashboardData.loading.exchangeHistory, 
            exchanges: dashboardData.exchangeHistory,
            filters: filters,
            onFilterClick: () => setFilterModalOpen(true)
          }, 'ExchangeHistorySection')}
          {renderSection(ReputationSection, { 
            loading: dashboardData.loading.userReputation, 
            reputation: dashboardData.userReputation.reputation,
            totalReviews: dashboardData.userReputation.totalReviews,
            userRanking: dashboardData.userReputation.userRanking,
            topPercentage: dashboardData.userReputation.topPercentage,
          }, 'ReputationSection')}
          {renderSection(SkillMatchesSection, { loading: dashboardData.loading.skillMatches, matches: dashboardData.skillMatches }, 'SkillMatchesSection')}
          {renderSection(UpcomingExchangesSection, { loading: dashboardData.loading.upcomingExchanges, exchanges: dashboardData.upcomingExchanges }, 'UpcomingExchangesSection')}
          {renderSection(PersonalizedRecommendationsSection, { loading: dashboardData.loading.personalizedRecommendations, recommendations: dashboardData.personalizedRecommendations }, 'PersonalizedRecommendationsSection')}
          {renderSection(AchievementsSection, { loading: dashboardData.loading.achievements, achievements: dashboardData.achievements }, 'AchievementsSection')}
          {renderSection(LearningGoalsSection, { 
            loading: dashboardData.loading.learningGoals, 
            goals: dashboardData.learningGoals,
            onAddGoal: handleAddToLearningGoals 
          }, 'LearningGoalsSection')}
        </main>
      </div>

      <Modal isOpen={showNotifications} onClose={() => setShowNotifications(false)} title="Notifications">
        {/* Notifications content */}
      </Modal>

      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Settings">
        {/* Settings content */}
      </Modal>

      <FilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      <Toast
        show={showToast}
        message={toastMessage}
        type={toastType}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default Dashboard;