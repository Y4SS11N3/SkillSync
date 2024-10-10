import React from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import moment from 'moment';

const ExchangeSessionCard = ({ session }) => {
  const {
    status,
    scheduledTime,
    duration,
    user1,
    user2,
    skill1,
    skill2
  } = session;

  const currentUserId = useSelector(state => state.auth.user.id);
  const otherUser = user1.id === currentUserId ? user2 : user1;
  const userSkill = user1.id === currentUserId ? skill1 : skill2;
  const otherUserSkill = user1.id === currentUserId ? skill2 : skill1;

  const startTime = moment(scheduledTime);
  const endTime = moment(scheduledTime).add(duration, 'minutes');

  return (
    <motion.div
      className={`bg-white rounded-xl shadow-md p-4 mb-4 border-l-4 ${
        status === 'pending' ? 'border-yellow-500' :
        status === 'accepted' ? 'border-green-500' :
        status === 'completed' ? 'border-blue-500' :
        'border-red-500'
      }`}
      whileHover={{ y: -5, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-800">
          {userSkill.name} ⇄ {otherUserSkill.name}
        </h3>
        <span className={`text-sm font-medium px-2 py-1 rounded-full ${
          status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          status === 'accepted' ? 'bg-green-100 text-green-800' :
          status === 'completed' ? 'bg-blue-100 text-blue-800' :
          'bg-red-100 text-red-800'
        }`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
      <p className="text-gray-600 mb-2">
        {startTime.format('MMMM D, YYYY')}
      </p>
      <p className="text-gray-600 mb-2">
        {startTime.format('h:mm A')} - {endTime.format('h:mm A')}
      </p>
      <p className="text-gray-600">
        With {otherUser.name}
      </p>
    </motion.div>
  );
};

export default ExchangeSessionCard;