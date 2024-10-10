import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const EventModal = ({ isOpen, onClose, date, events, currentUserId }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="bg-white rounded-lg p-6 max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{moment(date).format('MMMM D, YYYY')}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {events.map((event, index) => {
              const otherUser = event.user1.id === currentUserId ? event.user2 : event.user1;
              const userSkill = event.user1.id === currentUserId ? event.skill1 : event.skill2;
              const otherUserSkill = event.user1.id === currentUserId ? event.skill2 : event.skill1;
              return (
                <div
                  key={index}
                  className={`p-3 mb-2 rounded-lg ${
                    event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    event.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    event.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}
                >
                  <h3 className="font-semibold">{userSkill.name} ⇄ {otherUserSkill.name}</h3>
                  <p className="text-sm">With {otherUser.name}</p>
                  <p className="text-sm">{moment(event.scheduledTime).format('h:mm A')} - {moment(event.scheduledTime).add(event.duration, 'minutes').format('h:mm A')}</p>
                  <p className="text-sm font-semibold mt-1">{event.status.charAt(0).toUpperCase() + event.status.slice(1)}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const Calendar = ({ events, currentUserId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getNoOfDays = () => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const dayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth()).getDay();
    return { daysInMonth, dayOfWeek };
  };

  const { daysInMonth, dayOfWeek } = getNoOfDays();

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const eventForDate = (date) => {
    return events.filter(e => moment(e.scheduledTime).startOf('day').isSame(moment(date).startOf('day')));
  };

  const openModal = (date, events) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="flex items-center justify-between py-2 px-6">
        <div>
          <span className="text-lg font-bold text-gray-800">{MONTH_NAMES[currentDate.getMonth()]}</span>
          <span className="ml-1 text-lg text-gray-600 font-normal">{currentDate.getFullYear()}</span>
        </div>
        <div className="border rounded-lg px-1" style={{ paddingTop: '2px' }}>
          <button
            type="button"
            className="leading-none rounded-lg transition ease-in-out duration-100 inline-flex cursor-pointer hover:bg-gray-200 p-1 items-center"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
          >
            <ChevronLeft className="h-6 w-6 text-gray-500 inline-flex leading-none" />
          </button>
          <div className="border-r inline-flex h-6"></div>
          <button
            type="button"
            className="leading-none rounded-lg transition ease-in-out duration-100 inline-flex items-center cursor-pointer hover:bg-gray-200 p-1"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
          >
            <ChevronRight className="h-6 w-6 text-gray-500 inline-flex leading-none" />
          </button>
        </div>
      </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200">
        {DAYS.map((day, index) => (
          <div key={index} className="bg-gray-50 p-2">
            <div className="text-gray-600 text-sm uppercase tracking-wide font-bold text-center">{day}</div>
          </div>
        ))}
        
        {Array.from({ length: dayOfWeek }).map((_, index) => (
          <div key={`blank-${index}`} className="bg-white p-2 h-40"></div>
        ))}
        
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), index + 1);
          const dateEvents = eventForDate(date);
          return (
            <div key={index} className="bg-white p-2 h-40 overflow-y-auto">
              <div
                className={`inline-flex w-6 h-6 items-center justify-center cursor-pointer text-center leading-none rounded-full transition ease-in-out duration-100 ${
                  isToday(date) ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-blue-200'
                }`}
              >
                {index + 1}
              </div>
              <div className="mt-1">
                {dateEvents.slice(0, 2).map((event, eventIndex) => {
                  const otherUser = event.user1.id === currentUserId ? event.user2 : event.user1;
                  const userSkill = event.user1.id === currentUserId ? event.skill1 : event.skill2;
                  const otherUserSkill = event.user1.id === currentUserId ? event.skill2 : event.skill1;
                  return (
                    <div
                      key={eventIndex}
                      className={`p-1 mb-1 rounded text-xs ${
                        event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        event.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        event.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      <p className="font-semibold">{userSkill.name} ⇄ {otherUserSkill.name}</p>
                      <p>With {otherUser.name}</p>
                    </div>
                  );
                })}
                {dateEvents.length > 2 && (
                  <div
                    className="text-xs text-blue-600 cursor-pointer hover:text-blue-800"
                    onClick={() => openModal(date, dateEvents)}
                  >
                    +{dateEvents.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        date={selectedDate}
        events={selectedDate ? eventForDate(selectedDate) : []}
        currentUserId={currentUserId}
      />
    </div>
  );
};

const SessionCalendar = () => {
    const { exchanges, loading: exchangesLoading } = useSelector(state => state.exchanges);
    const user = useSelector(state => state.auth.user);
    const userLoading = useSelector(state => state.auth.loading);
  
    const loading = exchangesLoading || userLoading;
  
    if (loading) {
      return (
        <motion.div 
          className="bg-white rounded-xl shadow-md p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Session Calendar</h2>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </motion.div>
      );
    }
  
    if (!user) {
      return (
        <motion.div 
          className="bg-white rounded-xl shadow-md p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Session Calendar</h2>
          <p className="text-center text-gray-600">Please log in to view your session calendar.</p>
        </motion.div>
      );
    }
  
    return (
      <motion.div 
        className="bg-white rounded-xl shadow-md p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Session Calendar</h2>
        <Calendar events={exchanges} currentUserId={user.id} />
      </motion.div>
    );
  };
  
  export default SessionCalendar;