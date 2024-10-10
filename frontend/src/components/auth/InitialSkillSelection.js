import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchSkills } from '../../redux/actions/skillActions';
import { submitInitialSkills } from '../../redux/actions/authActions';

const InitialSkillSelection = () => {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const allSkills = useSelector(state => state.skills.skills);

  useEffect(() => {
    dispatch(fetchSkills(null, 1));
  }, [dispatch]);

  const handleSkillToggle = (skillId) => {
    setSelectedSkills(prev => 
      prev.includes(skillId)
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    );
  };

  const handleSubmit = async () => {
    if (selectedSkills.length < 3) {
      alert('Please select at least 3 skills');
      return;
    }
    try {
      const updatedUser = await dispatch(submitInitialSkills(selectedSkills));
      if (updatedUser.initialSetupComplete) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error submitting initial skills:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#e6f3ff] to-[#f0e6ff] dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-4xl">
        <h2 className="text-3xl font-bold text-[#0088cc] dark:text-white mb-6">Select Your Interests</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Choose at least 3 skills you're interested in learning or sharing:</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {allSkills.map(skill => (
            <motion.button
              key={skill.id}
              onClick={() => handleSkillToggle(skill.id)}
              className={`p-3 rounded-lg text-sm font-medium ${
                selectedSkills.includes(skill.id)
                  ? 'bg-[#0088cc] text-white'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {skill.name}
            </motion.button>
          ))}
        </div>
        <motion.button
          onClick={handleSubmit}
          className="w-full py-3 px-6 text-white bg-[#0088cc] rounded-lg font-medium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={selectedSkills.length < 3}
        >
          Continue
        </motion.button>
      </div>
    </div>
  );
};

export default InitialSkillSelection;