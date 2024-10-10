import React from 'react';
import { motion } from 'framer-motion';
import SkillCard from './SkillCard';

const SkillCardList = ({ skillsToRender, onSkillSelect, setSelectedSkill, setShowExchangeModal }) => {
  if (skillsToRender.length === 0) {
    return <div className="text-center text-gray-500 text-xl">No skills found matching your criteria. Try adjusting your search or filters.</div>;
  }

  const handleSkillSelect = (skill) => {
    console.log('Skill selected:', skill);
    onSkillSelect(skill);
    setSelectedSkill(skill);
    setShowExchangeModal(true);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {skillsToRender.map((skill, index) => (
        <motion.div
          key={`${skill.id}-${skill.provider.id}-${index}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <SkillCard
            skill={skill}
            isSearchResult={true}
            matchPercentage={skill.matchPercentage}
            provider={skill.provider}
            skillsYouWant={skill.skillsYouWant}
            skillsTheyWant={skill.skillsTheyWant}
            onSelect={() => handleSkillSelect(skill)}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default SkillCardList;