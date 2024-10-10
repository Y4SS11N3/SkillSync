import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CalendarIcon, ClockIcon, UserIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

const ExchangeDetailsModal = ({ isOpen, onClose, exchange, currentUserId, onRespond, onComplete, onCancel }) => {
  if (!exchange) return null;

  const isRecipient = exchange.user2Id === currentUserId;
  const isRequester = exchange.user1Id === currentUserId;

  const handleRespond = (action) => {
    onRespond(exchange.id, action);
    onClose();
  };

  const handleComplete = () => {
    onComplete(exchange.id);
    onClose();
  };

  const handleCancel = () => {
    onCancel(exchange.id);
    onClose();
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={onClose}
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

          <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
          
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
              <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                Exchange Details
              </Dialog.Title>
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
                onClick={onClose}
              >
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
              <div className="mt-4 space-y-4">
                <p className="flex items-center text-sm text-gray-500">
                  <UserIcon className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="font-medium mr-2">With:</span>
                  {isRecipient ? exchange.user1?.name : exchange.user2?.name}
                </p>
                <p className="flex items-center text-sm text-gray-500">
                  <AcademicCapIcon className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="font-medium mr-2">You'll Teach:</span>
                  {isRecipient ? exchange.skill2?.name : exchange.skill1?.name}
                </p>
                <p className="flex items-center text-sm text-gray-500">
                  <AcademicCapIcon className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="font-medium mr-2">You'll Learn:</span>
                  {isRecipient ? exchange.skill1?.name : exchange.skill2?.name}
                </p>
                <p className="flex items-center text-sm text-gray-500">
                  <ClockIcon className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="font-medium mr-2">Duration:</span>
                  {exchange.duration} hours
                </p>
                <p className="flex items-center text-sm text-gray-500">
                  <CalendarIcon className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="font-medium mr-2">Scheduled:</span>
                  {new Date(exchange.scheduledTime).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Status:</span>{' '}
                  <span className="capitalize">{exchange.status}</span>
                </p>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                {isRecipient && exchange.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleRespond('accept')}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRespond('decline')}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300"
                    >
                      Decline
                    </button>
                  </>
                )}
                {exchange.status === 'accepted' && (
                  <button
                    onClick={handleComplete}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
                  >
                    Complete
                  </button>
                )}
                {(isRequester || exchange.status === 'accepted') && exchange.status !== 'completed' && exchange.status !== 'cancelled' && (
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-300"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ExchangeDetailsModal;