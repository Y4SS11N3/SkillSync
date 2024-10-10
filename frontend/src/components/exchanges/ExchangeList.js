import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarIcon, ClockIcon, UserIcon, ChevronDownIcon, ChevronUpIcon, FunnelIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { cancelExchange, respondToExchange, completeExchange } from '../../redux/actions/exchangeActions';
import ExchangeDetailsModal from './ExchangeDetailsModal';
import ReviewModal from './ReviewModal';

const StatusBadge = ({ status }) => {
  const colorClasses = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    declined: 'bg-orange-100 text-orange-800',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses[status] || 'bg-gray-100 text-gray-800'}`}>
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
    </span>
  );
};

const FilterButton = ({ status, activeFilter, onClick }) => {
  const isActive = activeFilter === status;
  return (
    <button
      onClick={() => onClick(status)}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
        isActive
          ? 'bg-blue-500 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </button>
  );
};

const ExchangeCard = ({ exchange, onViewDetails, onLeaveReview, onCancel, currentUserId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const isRecipient = exchange.user2Id === currentUserId;
  const isRequester = exchange.user1Id === currentUserId;


  const getExchangePartnerName = () => {
    const partnerUser = exchange.user1Id === currentUserId ? exchange.user2 : exchange.user1;
    if (!partnerUser) {
      console.error(`Partner user data missing for exchange ${exchange.id}`);
      return 'User data unavailable';
    }
    return partnerUser.name || `User ${partnerUser.id}`;
  };

  const getExchangeSkillName = () => {
    const skill = exchange.user1Id === currentUserId ? exchange.skill2 : exchange.skill1;
    if (!skill) {
      console.error(`Skill data missing for exchange ${exchange.id}`);
      return 'Skill data unavailable';
    }
    return skill.name || `Skill ${skill.id}`;
  };

  const handleOpenChat = () => {
    navigate(`/chat/${exchange.id}`);
  };

  if (!exchange) {
    return <div>Loading exchange data...</div>;
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
    >
     <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {getExchangeSkillName()}
          </h3>
          <StatusBadge status={exchange.status} />
        </div>
        <div className="space-y-3">
          <p className="flex items-center text-gray-600 dark:text-gray-400">
            <UserIcon className="h-5 w-5 mr-2" />
            <span className="font-medium mr-2">With:</span> {getExchangePartnerName()}
          </p>
          <p className="flex items-center text-gray-600 dark:text-gray-400">
            <ClockIcon className="h-5 w-5 mr-2" />
            <span className="font-medium mr-2">Duration:</span> {exchange.duration || 'Unknown'} hours
          </p>
          {isExpanded && (
            <p className="flex items-center text-gray-600 dark:text-gray-400">
              <CalendarIcon className="h-5 w-5 mr-2" />
              <span className="font-medium mr-2">Scheduled:</span> {exchange.scheduledTime ? new Date(exchange.scheduledTime).toLocaleString() : 'Not scheduled'}
            </p>
          )}
        </div>
      </div>
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-500 hover:text-blue-600 focus:outline-none"
          >
            {isExpanded ? (
              <ChevronUpIcon className="h-5 w-5" />
            ) : (
              <ChevronDownIcon className="h-5 w-5" />
            )}
          </button>
          <div className="flex space-x-2">
            {exchange.status === 'accepted' && (
              <button
                onClick={handleOpenChat}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              >
                <ChatBubbleLeftIcon className="h-5 w-5 mr-2 inline-block" />
                Chat
              </button>
            )}
            <button
              onClick={() => onViewDetails(exchange)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              View Details
            </button>
            {exchange.status === 'completed' && (
              <button
                onClick={() => onLeaveReview(exchange)}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              >
                Leave Review
              </button>
            )}
            {isRequester && exchange.status === 'pending' && (
              <button
                onClick={() => onCancel(exchange.id)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ExchangeList = ({ exchanges }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.auth.user);
  const [selectedExchange, setSelectedExchange] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');


  const sortedAndFilteredExchanges = useMemo(() => {
    const statusOrder = ['pending', 'accepted', 'completed', 'declined', 'cancelled'];
    let filteredExchanges = [...exchanges];
    
    if (statusFilter !== 'all') {
      filteredExchanges = filteredExchanges.filter(exchange => exchange.status === statusFilter);
    }
    
    const sorted = filteredExchanges.sort((a, b) => 
      statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
    );

    return sorted;
  }, [exchanges, statusFilter]);

  const displayedExchanges = showAll ? sortedAndFilteredExchanges : sortedAndFilteredExchanges.slice(0, 6);

  const handleViewDetails = (exchange) => {
    setSelectedExchange(exchange);
    setIsDetailsModalOpen(true);
  };

  const handleLeaveReview = (exchange) => {
    setSelectedExchange(exchange);
    setIsReviewModalOpen(true);
  };

  const handleCancel = (exchangeId) => {
    dispatch(cancelExchange(exchangeId));
  };

  const handleRespond = (exchangeId, action) => {
    dispatch(respondToExchange(exchangeId, action));
  };

  const handleComplete = (exchangeId) => {
    dispatch(completeExchange(exchangeId));
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
    setSelectedExchange(null);
  };

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    setShowAll(false);
  };

  if (!exchanges || exchanges.length === 0) {
    return <div className="text-center text-gray-500">No exchanges found.</div>;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Exchanges</h2>
        <div className="flex items-center space-x-2">
          <FunnelIcon className="h-5 w-5 text-gray-500" />
          <div className="flex space-x-2">
            <FilterButton status="all" activeFilter={statusFilter} onClick={handleFilterChange} />
            <FilterButton status="pending" activeFilter={statusFilter} onClick={handleFilterChange} />
            <FilterButton status="accepted" activeFilter={statusFilter} onClick={handleFilterChange} />
            <FilterButton status="completed" activeFilter={statusFilter} onClick={handleFilterChange} />
            <FilterButton status="declined" activeFilter={statusFilter} onClick={handleFilterChange} />
            <FilterButton status="cancelled" activeFilter={statusFilter} onClick={handleFilterChange} />
          </div>
        </div>
      </div>
      <AnimatePresence>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayedExchanges.map((exchange) => (
            <ExchangeCard
              key={exchange.id}
              exchange={exchange}
              onViewDetails={handleViewDetails}
              onLeaveReview={handleLeaveReview}
              onCancel={handleCancel}
              currentUserId={currentUser.id}
            />
          ))}
        </div>
      </AnimatePresence>
      
      {sortedAndFilteredExchanges.length > 6 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            {showAll ? 'Show Less' : 'Show More'}
          </button>
        </div>
      )}

      <ExchangeDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        exchange={selectedExchange}
        currentUserId={currentUser.id}
        onRespond={handleRespond}
        onComplete={handleComplete}
        onCancel={handleCancel}
      />

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={handleCloseReviewModal}
        exchange={selectedExchange}
      />
    </>
  );
};

export default ExchangeList;