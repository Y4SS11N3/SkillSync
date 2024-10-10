import React from 'react';
import { ChartBarIcon, ChartPieIcon, ClockIcon, BoltIcon } from '@heroicons/react/24/outline';
import StatCard from '../common/StatCard';

const SkillOverview = ({ skillStats }) => {
  if (!skillStats) return null;

  const formatValue = (value) => value !== undefined ? value.toFixed(1) : 'N/A';
  const formatChange = (change) => change !== undefined ? `${change > 0 ? '+' : ''}${change}%` : 'N/A';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        icon={ChartBarIcon}
        title="Total Skills"
        value={skillStats.totalSkills || 0}
        change={formatChange(skillStats.skillGrowth)}
        changeType={(skillStats.skillGrowth || 0) >= 0 ? 'increase' : 'decrease'}
      />
      <StatCard
        icon={ChartPieIcon}
        title="Average Proficiency"
        value={`${formatValue(skillStats.averageProficiency)}/10`}
        change={formatChange(skillStats.proficiencyGrowth)}
        changeType={(skillStats.proficiencyGrowth || 0) >= 0 ? 'increase' : 'decrease'}
      />
      <StatCard
        icon={ClockIcon}
        title="Total Practice Time"
        value={`${skillStats.totalPracticeTime || 0}h`}
        change={formatChange(skillStats.practiceTimeGrowth)}
        changeType={(skillStats.practiceTimeGrowth || 0) >= 0 ? 'increase' : 'decrease'}
      />
      <StatCard
        icon={BoltIcon}
        title="Skill Versatility"
        value={skillStats.skillVersatility || 0}
        change={formatChange(skillStats.versatilityGrowth)}
        changeType={(skillStats.versatilityGrowth || 0) >= 0 ? 'increase' : 'decrease'}
      />
    </div>
  );
};

export default SkillOverview;