import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import Header from '../components/Header/AuthenticatedHeader';
import { 
  fetchExchanges, 
  fetchExchangeAnalytics,
} from '../redux/actions/exchangeActions';
import UpcomingSessions from '../components/exchange_session/UpcomingSessions';
import ExchangeStatistics from '../components/exchange_session/ExchangeStatistics';
import SessionCalendar from '../components/exchange_session/SessionCalendar';
import CreateExchangeModal from '../components/exchange_session/CreateExchangeModal';
import ExchangeRequestList from '../components/exchange_session/ExchangeRequestList';


const ExchangeSessions = () => {
  // State for active section and modal visibility
  const [activeSection, setActiveSection] = useState('exchange-sessions');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const dispatch = useDispatch();
  
  // Select relevant state from Redux store
  const { exchanges, loading, error, analytics } = useSelector(state => state.exchanges);

  // Fetch exchanges and analytics on component mount
  useEffect(() => {
    dispatch(fetchExchanges());
    dispatch(fetchExchangeAnalytics());
  }, [dispatch]);

  /**
   * Opens the create exchange modal
   */
  const handleCreateExchange = () => {
    setIsCreateModalOpen(true);
  };

  // Display error message if there's an error
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 overflow-auto">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.h1 
            className="text-3xl font-bold text-gray-900 mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Exchange Sessions
          </motion.h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <UpcomingSessions exchanges={exchanges} loading={loading} />
            </div>
            <ExchangeStatistics exchanges={exchanges} loading={loading} />
          </div>

          <div className="mb-8">
            <ExchangeRequestList />
          </div>

          <SessionCalendar exchanges={exchanges} loading={loading} />
        </main>
      </div>
      <button 
        className="fixed bottom-8 right-8 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition duration-300"
        onClick={handleCreateExchange}
        aria-label="Create new exchange"
      >
        <Plus size={24} />
      </button>
      <CreateExchangeModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
};

export default ExchangeSessions;