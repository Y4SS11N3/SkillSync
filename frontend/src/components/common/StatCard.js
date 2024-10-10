import React from 'react';

const StatCard = ({ icon: Icon, title, value, change, changeType }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
    <div className="flex items-center">
      <div className={`p-3 rounded-full ${changeType === 'increase' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} dark:bg-opacity-20`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="ml-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
        <p className={`text-sm ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </p>
      </div>
    </div>
  </div>
);

export default StatCard;