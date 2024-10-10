import React, { useState } from 'react';
import ProgressBar from '../common/ProgressBar';
import Loader from '../common/Loader';
import { FlagIcon, ClockIcon, TrophyIcon, PlusIcon } from 'lucide-react';
import AddLearningGoalModal from './AddLearningGoalModal';

export default function LearningGoalsSection({ loading, goals, onAddGoal }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (loading) return <Loader />;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Learning Goals</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition duration-300"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Goal</span>
        </button>
      </div>
      
      {goals && goals.length > 0 ? (
        <div className="space-y-6">
          {goals.map(goal => (
            <div key={goal.id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-md transition-all duration-300 hover:shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-3">
                  <FlagIcon className="w-6 h-6 text-blue-500" />
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{goal.skill}</h3>
                </div>
                <div className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100">
                  {goal.status}
                </div>
              </div>
              <ProgressBar progress={goal.progress} />
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                  <TrophyIcon className="w-5 h-5" />
                  <span>Level {goal.currentLevel} → {goal.targetLevel}</span>
                </div>
                <div className="font-semibold text-blue-600 dark:text-blue-400">
                  {goal.progress > 0 ? `${goal.progress}% Complete` : 'Just started'}
                </div>
              </div>
              <div className="flex justify-between items-center mt-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <ClockIcon className="w-4 h-4" />
                  <span>{goal.daysRemaining > 0 ? `${goal.daysRemaining} days left` : 'Deadline passed'}</span>
                </div>
                <div>Target: {new Date(goal.targetDate).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 dark:text-gray-400">
          No learning goals yet. Click the "Add Goal" button to get started!
        </div>
      )}

      <AddLearningGoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddGoal={onAddGoal}
      />
    </div>
  );
}