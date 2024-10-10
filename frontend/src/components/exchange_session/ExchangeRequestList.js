import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, UserIcon, ClockIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { fetchExchanges, respondToExchange } from '../../redux/actions/exchangeActions';
import { Dialog, Transition } from '@headlessui/react';

const ExchangeRequestItem = ({ exchange, onRespond, currentUserId }) => {
  const isRecipient = exchange.user2Id === currentUserId;

  const handleRespond = async (action) => {
    try {
      await onRespond(exchange.id, action);
    } catch (error) {
      console.error('Failed to respond to exchange request:', error);
    }
  };

  const renderStatus = () => {
    switch (exchange.status) {
      case 'pending':
        return <span className="text-yellow-500 font-semibold">Pending</span>;
      case 'accepted':
        return <span className="text-green-500 font-semibold">Accepted</span>;
      case 'declined':
        return <span className="text-red-500 font-semibold">Declined</span>;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 transition-all duration-300 hover:shadow-xl"
    >
      <div className="flex flex-col md:flex-row justify-between items-start">
        <div className="flex-grow">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Exchange with {isRecipient ? exchange.user1.name : exchange.user2.name}
          </h3>
          <div className="space-y-3">
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <UserIcon className="h-6 w-6 mr-3 text-blue-500" />
              <span className="text-lg">
                {isRecipient ? (
                  <>{exchange.user1.name} wants to learn <span className="font-semibold text-blue-600 dark:text-blue-400">{exchange.skill2.name}</span></>
                ) : (
                  <>You want to learn <span className="font-semibold text-blue-600 dark:text-blue-400">{exchange.skill2.name}</span></>
                )}
              </span>
            </div>
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <BookOpenIcon className="h-6 w-6 mr-3 text-green-500" />
              <span className="text-lg">
                {isRecipient ? (
                  <>You'll teach <span className="font-semibold text-green-600 dark:text-green-400">{exchange.skill1.name}</span></>
                ) : (
                  <>{exchange.user2.name} will teach you <span className="font-semibold text-green-600 dark:text-green-400">{exchange.skill1.name}</span></>
                )}
              </span>
            </div>
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <ClockIcon className="h-6 w-6 mr-3 text-purple-500" />
              <span className="text-lg">Duration: <span className="font-semibold text-purple-600 dark:text-purple-400">{exchange.duration} minutes</span></span>
            </div>
          </div>
        </div>
        <div className="flex mt-6 md:mt-0 space-x-4">
          {isRecipient && exchange.status === 'pending' ? (
            <>
              <button
                onClick={() => handleRespond('accept')}
                className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-full hover:from-green-500 hover:to-green-700 transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              >
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Accept
              </button>
              <button
                onClick={() => handleRespond('decline')}
                className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-400 to-red-600 text-white rounded-full hover:from-red-500 hover:to-red-700 transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              >
                <XCircleIcon className="h-5 w-5 mr-2" />
                Decline
              </button>
            </>
          ) : (
            <div className="flex items-center justify-center px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full">
              Status: {renderStatus()}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const ExchangeRequestList = () => {
  const dispatch = useDispatch();
  const { exchanges, loading, error, currentUser } = useSelector(state => ({
    ...state.exchanges,
    currentUser: state.auth.user
  }));
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchExchanges());
  }, [dispatch]);

  const pendingExchanges = useMemo(() => {
    return exchanges.filter(exchange => exchange.status === 'pending');
  }, [exchanges]);

  const handleRespond = async (exchangeId, action) => {
    try {
      await dispatch(respondToExchange(exchangeId, action));
      dispatch(fetchExchanges());
    } catch (error) {
      console.error('Failed to respond to exchange:', error);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md" role="alert">
      <p className="font-bold">Error</p>
      <p>{error}</p>
    </div>
  );

  return (
    <div className="exchange-request-list space-y-8">
      <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">
        Pending Exchange Requests
      </h2>
      <AnimatePresence>
        {pendingExchanges.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 text-center"
          >
            <p className="text-xl text-gray-600 dark:text-gray-300">
              No pending exchange requests at the moment.
            </p>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Check back later or create a new exchange!
            </p>
          </motion.div>
        ) : (
          <>
            {pendingExchanges.slice(0, 5).map(exchange => (
              <ExchangeRequestItem
                key={exchange.id}
                exchange={exchange}
                onRespond={handleRespond}
                currentUserId={currentUser.id}
              />
            ))}
            {pendingExchanges.length > 5 && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                View More Exchanges
              </button>
            )}
          </>
        )}
      </AnimatePresence>

      <Transition appear show={isModalOpen} as={React.Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => setIsModalOpen(false)}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
            </Transition.Child>

            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  All Pending Exchange Requests
                </Dialog.Title>
                <div className="mt-2 max-h-96 overflow-y-auto">
                  {pendingExchanges.map(exchange => (
                    <ExchangeRequestItem
                      key={exchange.id}
                      exchange={exchange}
                      onRespond={handleRespond}
                      currentUserId={currentUser.id}
                    />
                  ))}
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default ExchangeRequestList;