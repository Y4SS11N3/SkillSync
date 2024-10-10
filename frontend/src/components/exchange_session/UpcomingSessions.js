import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ExchangeSessionCard from './ExchangeSessionCard';
import SessionModal from './SessionModal';

const UpcomingSessions = ({ exchanges, loading }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const visibleSessions = 3; // Number of sessions to show initially

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <motion.div 
      className="col-span-2 bg-white rounded-xl shadow-md p-6"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Sessions</h2>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : exchanges.length > 0 ? (
        <>
          {exchanges.slice(0, visibleSessions).map(session => (
            <ExchangeSessionCard key={session.id} session={session} />
          ))}
          {exchanges.length > visibleSessions && (
            <div className="mt-4 text-center">
              <button
                onClick={openModal}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
              >
                View All Sessions
              </button>
            </div>
          )}
          <SessionModal 
            isOpen={isModalOpen} 
            onClose={closeModal} 
            sessions={exchanges}
          />
        </>
      ) : (
        <p className="text-gray-600 text-center py-8">No upcoming sessions available.</p>
      )}
    </motion.div>
  );
};

export default UpcomingSessions;