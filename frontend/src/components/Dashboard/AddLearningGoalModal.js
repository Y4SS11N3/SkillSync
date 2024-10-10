import React, { useState } from 'react';
import { XIcon } from 'lucide-react';

export default function AddLearningGoalModal({ isOpen, onClose, onAddGoal }) {
  const [skillId, setSkillId] = useState('');
  const [targetLevel, setTargetLevel] = useState(5);
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddGoal({ skillId, targetLevel, deadline });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Add Learning Goal</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="skillId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Skill</label>
            <select
              id="skillId"
              value={skillId}
              onChange={(e) => setSkillId(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            >
              <option value="">Select a skill</option>
              {/* NEXT options based on available skills */}
            </select>
          </div>
          <div>
            <label htmlFor="targetLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Level</label>
            <input
              type="number"
              id="targetLevel"
              value={targetLevel}
              onChange={(e) => setTargetLevel(parseInt(e.target.value))}
              min="1"
              max="5"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Deadline</label>
            <input
              type="date"
              id="deadline"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
          >
            Add Goal
          </button>
        </form>
      </div>
    </div>
  );
}