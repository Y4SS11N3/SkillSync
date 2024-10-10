import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { createReview } from '../../redux/actions/exchangeActions';

const ReviewModal = ({ isOpen, onClose, exchange }) => {

  const dispatch = useDispatch();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!exchange?.id) {
      console.error('No exchange id available for review submission');
      return;
    }
    dispatch(createReview(exchange.id, rating, comment));
    onClose();
  }, [dispatch, exchange, rating, comment, onClose]);


  if (!exchange) {
    return null;
  }

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

          <span className="inline-block h-screen align-middle" aria-hidden="true">
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
              <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                Leave a Review
              </Dialog.Title>
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
                onClick={onClose}
              >
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rating</label>
                  <div className="flex items-center mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="text-yellow-400 hover:text-yellow-500 focus:outline-none"
                        onClick={() => setRating(star)}
                      >
                        {star <= rating ? (
                          <StarIconSolid className="h-6 w-6" />
                        ) : (
                          <StarIcon className="h-6 w-6" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                    Comment
                  </label>
                  <textarea
                    id="comment"
                    name="comment"
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
                <div className="mt-5 sm:mt-6">
                  <button
                    type="submit"
                    className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ReviewModal;