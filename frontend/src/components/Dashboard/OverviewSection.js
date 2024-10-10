import React from 'react';
import StatCard from '../common/StatCard';
import Loader from '../common/Loader';
import { UserGroupIcon, ClockIcon, AcademicCapIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { formatNumber, formatCurrency, calculatePercentageChange } from '../../utils/formatters';

const OverviewSection = ({ loading, data }) => {
  if (loading) return <Loader />;
  if (!data || Object.keys(data).length === 0) return null;

  const {
    totalConnections = 0,
    previousTotalConnections = 0,
    hoursExchanged = 0,
    previousHoursExchanged = 0,
    skillsLearned = 0,
    previousSkillsLearned = 0,
    timeCredits = 0,
    previousTimeCredits = 0
  } = data;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        icon={UserGroupIcon}
        title="Total Connections"
        value={formatNumber(totalConnections)}
        change={calculatePercentageChange(totalConnections, previousTotalConnections)}
        changeType={totalConnections >= previousTotalConnections ? 'increase' : 'decrease'}
      />
      <StatCard
        icon={ClockIcon}
        title="Hours Exchanged"
        value={formatNumber(hoursExchanged)}
        change={calculatePercentageChange(hoursExchanged, previousHoursExchanged)}
        changeType={hoursExchanged >= previousHoursExchanged ? 'increase' : 'decrease'}
      />
      <StatCard
        icon={AcademicCapIcon}
        title="Skills Learned"
        value={formatNumber(skillsLearned)}
        change={calculatePercentageChange(skillsLearned, previousSkillsLearned)}
        changeType={skillsLearned >= previousSkillsLearned ? 'increase' : 'decrease'}
      />
      <StatCard
        icon={CurrencyDollarIcon}
        title="Time Credits"
        value={formatCurrency(timeCredits)}
        change={calculatePercentageChange(timeCredits, previousTimeCredits)}
        changeType={timeCredits >= previousTimeCredits ? 'increase' : 'decrease'}
      />
    </div>
  );
};

export default OverviewSection;