import React from 'react';

const SkillBadge = ({ name, level, className = '' }) => {
  const bgColor = level === 'beginner' ? 'bg-green-100' :
                  level === 'intermediate' ? 'bg-yellow-100' :
                  'bg-red-100';
  const textColor = level === 'beginner' ? 'text-green-800' :
                    level === 'intermediate' ? 'text-yellow-800' :
                    'text-red-800';

  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${bgColor} ${textColor} ${className}`}>
      {name} {level && `(${level})`}
    </span>
  );
};

export default SkillBadge;