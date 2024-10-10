import React from 'react';

const SkillHeatMap = ({ data }) => {
  const maxIntensity = Math.max(...data.map(item => item.intensity));

  const getColor = (intensity) => {
    const normalizedIntensity = intensity / maxIntensity;
    const hue = (1 - normalizedIntensity) * 240;
    return `hsl(${hue}, 100%, 50%)`;
  };

  return (
    <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
      <div className="grid grid-cols-10 gap-1 p-2">
        {data.map((item, index) => (
          <div
            key={index}
            className="group relative aspect-square rounded-sm"
            style={{ backgroundColor: getColor(item.intensity) }}
          >
            <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-300 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap z-10">
              {item.skill}: {item.count}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillHeatMap;