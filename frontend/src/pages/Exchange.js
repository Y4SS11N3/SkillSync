// React and related imports
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

// Redux action imports
import { 
  fetchSkills,
  getSkillTrends,
  clearSearchResults
} from '../redux/actions/skillActions';
import { 
  fetchExchanges,
  fetchExchangeAnalytics,
  connectForExchange,
  performAdvancedSkillSearch,
  createReview
} from '../redux/actions/exchangeActions';
import { fetchUserInterestedSkills, fetchUserKnownSkills } from '../redux/actions/userActions';

// Component imports
import Header from '../components/Header/AuthenticatedHeader';
import SearchBar from '../components/exchanges/SearchBar';
import FilterSection from '../components/exchanges/FilterSection';
import SkillHeatMap from '../components/exchanges/SkillHeatMap';
import TrendingSkills from '../components/skills/TrendingSkills';
import SkillCardList from '../components/exchanges/SkillCardList';
import ExchangeList from '../components/exchanges/ExchangeList';
import AnalyticsChart from '../components/exchanges/AnalyticsChart';
import ExchangeModal from '../components/exchanges/ExchangeModal';
import ReviewModal from '../components/reviews/ReviewModal';

// Icon imports
import { ChartBarIcon, FunnelIcon as FilterIcon } from '@heroicons/react/24/outline';

// Utility imports
import { toast } from 'react-hot-toast';

/**
 * Exchange component for skill discovery and exchange
 * @returns {JSX.Element} The Exchange page component
 */
const Exchange = () => {
  const dispatch = useDispatch();

  // Redux state selectors
  const { 
    skills, 
    loading, 
    error, 
    skillHeatMap, 
    skillTrends 
  } = useSelector(state => state.skills);
  const { 
    exchanges,
    analytics,
    suggestedMatches,
    globalSkillDemand,
    skillQuest,
    advancedSearchResults
  } = useSelector(state => state.exchanges);
  const currentUser = useSelector(state => state.auth.user);

  // Local state
  const [activeSection, setActiveSection] = useState('exchange');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [currentUserSkillId, setCurrentUserSkillId] = useState(null);
  const [showHeatMap, setShowHeatMap] = useState(false);
  const [showTrends, setShowTrends] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState(null);
  const [currentUserSkills, setCurrentUserSkills] = useState([]);
  const [partnerUser, setPartnerUser] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    level: 'all',
    timeCredit: 'all',
  });

  // Effects
  useEffect(() => {
    if (currentUser?.Skills) {
      setCurrentUserSkills(currentUser.Skills);
    }
  }, [currentUser]);

  useEffect(() => {
    dispatch(fetchExchanges());
    dispatch(fetchExchangeAnalytics());
    dispatch(getSkillTrends());
  }, [dispatch, currentUser]);

  useEffect(() => {
    if (searchTerm || Object.values(filters).some(value => value !== 'all')) {
      dispatch(performAdvancedSkillSearch({
        searchTerm,
        ...filters,
        page: 1,
        limit: 20
      }));
    } else {
      dispatch(clearSearchResults());
    }
  }, [searchTerm, filters, dispatch]);

  useEffect(() => {
    dispatch(fetchSkills());
  }, [dispatch]);

  // Event handlers
  /**
   * Handles the submission of a review
   * @param {number} exchangeId - The ID of the exchange being reviewed
   * @param {number} rating - The rating given in the review
   * @param {string} comment - The comment provided in the review
   */
  const handleReviewSubmit = (exchangeId, rating, comment) => {
    dispatch(createReview(exchangeId, rating, comment));
    setShowReviewModal(false);
  };

  /**
   * Initiates an exchange between users
   * @param {Object} exchangeDetails - Details of the exchange to be initiated
   */
  const handleExchangeInitiate = async (exchangeDetails) => {
    try {
      if (currentUserSkills.length === 0) {
        toast.error('Please add a skill to your profile before initiating an exchange.');
        return;
      }

      const payload = {
        user2Id: parseInt(exchangeDetails.user2Id, 10),
        skill1Id: parseInt(exchangeDetails.skill1Id, 10),
        skill2Id: parseInt(exchangeDetails.skill2Id, 10),
        duration: parseInt(exchangeDetails.duration, 10),
        proposedTime: exchangeDetails.proposedTime,
        details: exchangeDetails.details
      };
  
      await dispatch(connectForExchange(payload));
      toast.success('Connection request sent successfully!');
      setShowExchangeModal(false);
    } catch (error) {
      toast.error(`Failed to send connection request: ${error.message}`);
    }
  };

  /**
   * Handles the selection of a skill
   * @param {Object} skill - The selected skill
   */
  const handleSkillSelect = async (skill) => {
    console.log('handleSkillSelect called with skill:', skill);
    setSelectedSkill(skill);
    
    try {
      console.log('Fetching interested skills for user:', skill.provider.id);
      const interestedSkills = await dispatch(fetchUserInterestedSkills(skill.provider.id));
      console.log('Fetched interested skills:', interestedSkills);
      
      // Fetch current user's known skills
      const knownSkills = await dispatch(fetchUserKnownSkills(currentUser.id));
      console.log('Fetched known skills:', knownSkills);
      
      console.log('Setting partnerUser:', {
        id: skill.provider.id,
        name: skill.provider.name,
        interestedSkills: interestedSkills
      });
      
      setPartnerUser({
        id: skill.provider.id,
        name: skill.provider.name,
        interestedSkills: interestedSkills
      });
      
      setCurrentUserSkills(knownSkills);
      
      console.log('Opening modal');
      setShowExchangeModal(true);
    } catch (error) {
      console.error('Error fetching skills:', error);
      setPartnerUser({
        id: skill.provider.id,
        name: skill.provider.name,
        interestedSkills: []
      });
      setCurrentUserSkills([]);
      setShowExchangeModal(true);
    }
  };

  // Memoized values
  const skillsToRender = useMemo(() => {
    if (advancedSearchResults && (searchTerm || Object.values(filters).some(value => value !== 'all'))) {
      const allResults = [
        ...(advancedSearchResults.perfectMatches || []),
        ...(advancedSearchResults.potentialExchanges || []),
        ...(advancedSearchResults.yourOfferings || []),
        ...(advancedSearchResults.matchedSkills || [])
      ];
  
      return allResults.reduce((acc, item) => {
        const skill = item.matchedSkill || item;
        const existingItem = acc.find(i => i.id === skill.id && i.provider.id === skill.provider.id);
        if (existingItem) {
          return acc.map(accItem => 
            accItem.id === existingItem.id && accItem.provider.id === existingItem.provider.id
              ? {
                  ...accItem,
                  skillsYouWant: item.skillsYouWant || accItem.skillsYouWant,
                  skillsTheyWant: item.skillsTheyWant || accItem.skillsTheyWant
                }
              : accItem
          );
        } else {
          return [...acc, {
            ...skill,
            skillsYouWant: item.skillsYouWant,
            skillsTheyWant: item.skillsTheyWant
          }];
        }
      }, []);
    }
    return [];
  }, [advancedSearchResults, searchTerm, filters]);

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 overflow-auto">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.h1 
            className="text-4xl font-bold text-gray-800 mb-8 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Discover and Exchange Skills
          </motion.h1>

          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex flex-col md:flex-row items-center mb-8 space-y-4 md:space-y-0 md:space-x-4">
              <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

              <button
                onClick={() => setShowTrends(!showTrends)}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 text-lg font-semibold shadow-md hover:shadow-lg"
              >
                <ChartBarIcon className="h-6 w-6 mr-2" />
                {showTrends ? 'Hide' : 'Show'} Skill Trends
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-300 text-lg font-semibold shadow-md hover:shadow-lg"
              >
                <FilterIcon className="h-6 w-6 mr-2" />
                {showFilters ? 'Hide' : 'Show'} Filters
              </button>
            </div>

            <AnimatePresence>
              {showFilters && <FilterSection filters={filters} setFilters={setFilters} />}
            </AnimatePresence>

            <AnimatePresence>
              {showHeatMap && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-8 overflow-hidden"
                >
                  <SkillHeatMap data={skillHeatMap} />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showTrends && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-8 overflow-hidden"
                >
                  <TrendingSkills trends={skillTrends} />
                </motion.div>
              )}
            </AnimatePresence>

            <SkillCardList 
              skillsToRender={skillsToRender} 
              onSkillSelect={handleSkillSelect}
              setSelectedSkill={setSelectedSkill} 
              setShowExchangeModal={setShowExchangeModal} 
            />
          </motion.div>

          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <ExchangeList 
              exchanges={exchanges} 
              onLeaveReview={(exchange) => {
                setSelectedExchange(exchange);
                setShowReviewModal(true);
              }}
            />
          </motion.div>

          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Exchange Analytics</h2>
            <AnalyticsChart data={analytics} />
          </motion.div>
        </main>
      </div>

      <ExchangeModal
        isOpen={showExchangeModal}
        onClose={() => setShowExchangeModal(false)}
        skill={selectedSkill}
        onExchange={handleExchangeInitiate}
        currentUserSkills={currentUserSkills}
        partnerUser={partnerUser}
      />

      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setSelectedExchange(null);
        }}
        exchange={selectedExchange}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
};

export default Exchange;