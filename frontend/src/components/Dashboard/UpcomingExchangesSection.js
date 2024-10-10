import React from 'react';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import Loader from '../common/Loader';

const UpcomingExchangesSection = ({ loading, exchanges }) => {
  if (loading) return <Loader />;
  if (!exchanges || exchanges.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">Upcoming Exchanges</h2>
      <div className="space-y-6">
        {exchanges.map(exchange => (
          <div key={exchange.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 transition duration-300 ease-in-out hover:shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{exchange.partnerName}</h3>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-1">{exchange.skill}</p>
              </div>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                Accepted
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <CalendarIcon className="h-5 w-5 mr-2 text-gray-400" />
              {new Date(exchange.scheduledTime).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-300">
              <ClockIcon className="h-5 w-5 mr-2 text-gray-400" />
              {new Date(exchange.scheduledTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} - Duration: {exchange.duration} minutes
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingExchangesSection;