import React, { useMemo } from 'react';
import { FunnelIcon, CalendarIcon, ClockIcon, AcademicCapIcon, UserIcon } from '@heroicons/react/24/outline';
import Loader from '../common/Loader';

const ExchangeHistorySection = ({ loading, exchanges, filters, onFilterClick }) => {
  const filteredExchanges = useMemo(() => {
    if (!exchanges || exchanges.length === 0) return [];
    
    return exchanges.filter(exchange => {
      if (filters.exchangeStatus !== 'all' && exchange.status !== filters.exchangeStatus) return false;
      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'date') return new Date(b.date) - new Date(a.date);
      if (filters.sortBy === 'duration') return b.duration - a.duration;
      return 0;
    });
  }, [exchanges, filters]);

  if (loading) return <Loader />;
  if (filteredExchanges.length === 0) return <p className="text-center text-gray-500 dark:text-gray-400">No exchange history available.</p>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Exchange History</h2>
        <button
          onClick={onFilterClick}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          <FunnelIcon className="w-5 h-5 mr-2" />
          Filter
        </button>
      </div>
      <div className="space-y-6">
        {filteredExchanges.map((exchange) => (
          <div key={exchange.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 transition duration-300 ease-in-out hover:shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                  <AcademicCapIcon className="w-5 h-5 mr-2 text-blue-500" />
                  {exchange.skill}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center">
                  <UserIcon className="w-4 h-4 mr-2 text-gray-400" />
                  {exchange.type === 'taught' ? 'Taught to' : 'Learned from'}: {exchange.partnerName}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              exchange.status === 'completed' ? 'bg-green-100 text-green-800' :
              exchange.status === 'accepted' ? 'bg-yellow-100 text-yellow-800' :
              exchange.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {exchange.status}
            </span>
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
              {new Date(exchange.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-300">
              <ClockIcon className="w-4 h-4 mr-2 text-gray-400" />
              Duration: {exchange.duration} minutes
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExchangeHistorySection;