import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Calendar, PenSquare, Book } from 'lucide-react';

const ExchangeModal = ({ isOpen, onClose, skill, onExchange, currentUserSkills = [], partnerUser = {} }) => {
  console.log('ExchangeModal props:', { isOpen, skill, currentUserSkills, partnerUser });

  const [exchangeDetails, setExchangeDetails] = useState('');
  const [duration, setDuration] = useState(1);
  const [proposedTime, setProposedTime] = useState('');
  const [selectedUserSkillId, setSelectedUserSkillId] = useState('');

  useEffect(() => {
    if (currentUserSkills && currentUserSkills.length > 0) {
      setSelectedUserSkillId(currentUserSkills[0].id);
    }
  }, [currentUserSkills]);

  if (!isOpen || !skill) return null;

  const handleExchange = () => {
    if (!selectedUserSkillId) {
      alert('Please select a skill to offer for the exchange.');
      return;
    }

    const exchangeRequest = {
      user2Id: skill.provider.id,
      skill1Id: selectedUserSkillId,
      skill2Id: skill.id,
      duration: parseInt(duration, 10),
      proposedTime: proposedTime,
      details: exchangeDetails
    };
    onExchange(exchangeRequest);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-blue-50/70 dark:bg-gray-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md"
            >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                Connect for: {skill.name}
              </h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 transition-colors duration-200">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-200 dark:border-blue-700 p-4 rounded-md">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Level: {skill.level}, Time Credit: {skill.timeCredit} hours
              </p>
            </div>
            <div className="space-y-4">
            {currentUserSkills && currentUserSkills.length > 0 && (
              <div>
                <label htmlFor="userSkill" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Your Skill to Offer
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Book className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="userSkill"
                    value={selectedUserSkillId}
                    onChange={(e) => setSelectedUserSkillId(e.target.value)}
                    className="focus:ring-blue-200 focus:border-blue-300 block w-full pl-10 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    {currentUserSkills.map((userSkill) => (
                      <option key={userSkill.skillId} value={userSkill.skillId}>
                        {userSkill.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            {partnerUser && partnerUser.interestedSkills && partnerUser.interestedSkills.length > 0 ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {partnerUser.name}'s Interested Skills
                </label>
                <div className="mt-1 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                  <ul className="list-disc list-inside">
                    {partnerUser.interestedSkills.map((interestedSkill) => (
                      <li key={interestedSkill.id} className="text-sm text-gray-600 dark:text-gray-300">
                        {interestedSkill.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p>No partner interested skills available</p>
            )}
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duration (hours)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="duration"
                    type="number"
                    min="1"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="focus:ring-blue-200 focus:border-blue-300 block w-full pl-10 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="proposedTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Proposed Time
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="proposedTime"
                    type="datetime-local"
                    value={proposedTime}
                    onChange={(e) => setProposedTime(e.target.value)}
                    className="focus:ring-blue-200 focus:border-blue-300 block w-full pl-10 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="exchangeDetails" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Exchange Details
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                    <PenSquare className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    id="exchangeDetails"
                    value={exchangeDetails}
                    onChange={(e) => setExchangeDetails(e.target.value)}
                    placeholder="Enter exchange details..."
                    rows="4"
                    className="focus:ring-blue-200 focus:border-blue-300 block w-full pl-10 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleExchange}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:bg-blue-700 dark:text-blue-100 dark:hover:bg-blue-600"
              >
                Connect
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExchangeModal;