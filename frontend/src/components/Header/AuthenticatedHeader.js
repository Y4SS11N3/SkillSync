import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { 
  Bell, 
  DollarSign, 
  Star, 
  Sun, 
  Moon, 
  X, 
  Menu,
} from 'lucide-react';
import { updateUnreadCount } from '../../redux/actions/notificationActions';
import { loadUser } from '../../redux/actions/authActions';
import { fetchUserData } from '../../redux/actions/userActions';
import NotificationList from '../Notifications/NotificationList';

const IconButton = ({ Icon, label, value, color }) => (
  <div className={`flex items-center bg-opacity-10 rounded-full px-3 py-2 ${color}`}>
    <Icon size={18} className={`${color} mr-2`} />
    <span className="font-medium text-sm">{value ?? 'N/A'}</span>
    {label && <span className="text-xs text-gray-500 ml-1">{label}</span>}
  </div>
);

const ThemeToggle = ({ theme, toggleTheme }) => (
  <button
    onClick={toggleTheme}
    className="text-gray-500 hover:text-blue-500 transition-colors duration-200"
    aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
  >
    {theme === 'light' ? <Sun size={24} /> : <Moon size={24} />}
  </button>
);

const NotificationBell = ({ unreadCount, onClick }) => (
  <div className="relative cursor-pointer" onClick={onClick}>
    <Bell className="h-6 w-6 text-blue-500" />
    {unreadCount > 0 && (
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
        {unreadCount > 99 ? '99+' : unreadCount}
      </span>
    )}
  </div>
);

const NotificationModal = ({ isOpen, onClose, children }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
        <motion.div 
          className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Notifications</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
          {children}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const AuthenticatedHeader = ({ theme, toggleTheme }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { dashboardData, userReputation } = useSelector(state => state.dashboard);
  const { userData, loading: userLoading } = useSelector(state => state.user);
  const { isAuthenticated, loading: authLoading } = useSelector(state => state.auth);
  const notifications = useSelector(state => state.notifications);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [localUnreadCount, setLocalUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(() => {
    if (!isAuthenticated && !authLoading) {
      dispatch(loadUser());
    } else if (isAuthenticated && !authLoading && !userData) {
      dispatch(fetchUserData());
    }
  }, [isAuthenticated, authLoading, userData, dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    dispatch(updateUnreadCount());
  }, [dispatch]);

  useEffect(() => {
    setLocalUnreadCount(notifications?.unreadCount ?? 0);
  }, [notifications?.unreadCount]);

  const timeCredits = dashboardData?.timeCredits ?? 0;
  const reputationScore = userReputation?.score ?? 0;

  const handleNotificationClick = () => {
    setIsNotificationModalOpen(true);
    setLocalUnreadCount(0);
  };

  const handleCloseNotificationModal = () => {
    setIsNotificationModalOpen(false);
    dispatch(updateUnreadCount());
  };

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    return avatarPath.startsWith('http') ? avatarPath : `${process.env.REACT_APP_API_URL}/uploads/avatars/${avatarPath}`;
  };

  const pageTitle = {
    '/dashboard': 'Dashboard',
    '/exchange': 'Exchange',
    '/my-skills': 'My Skills',
    '/exchange-sessions': 'Exchange Sessions',
    '/chat': 'Chat',
    '/skill-map': 'Skill Map',
  }[location.pathname] || 'Dashboard';



  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h2 className="text-2xl font-bold text-gray-800 mr-4">{pageTitle}</h2>

          </div>
          <div className="hidden md:flex items-center space-x-4">
            <IconButton Icon={DollarSign} value={timeCredits} label="Credits" color="text-green-500 bg-green-100" />
            <IconButton Icon={Star} value={reputationScore.toFixed(1)} label="Rep" color="text-yellow-500 bg-yellow-100" />
            <NotificationBell 
              unreadCount={localUnreadCount} 
              onClick={handleNotificationClick}
            />
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            {userData?.avatar && (
              <img 
                src={getAvatarUrl(userData.avatar)} 
                alt="User Avatar" 
                className="h-8 w-8 rounded-full object-cover"
                onError={(e) => {
                  console.error('Error loading avatar:', e);
                  e.target.src = 'https://via.placeholder.com/32';
                }}
              />
            )}
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 space-y-4"
            >

              <div className="flex justify-between items-center">
                <IconButton Icon={DollarSign} value={timeCredits} label="Credits" color="text-green-500 bg-green-100" />
                <IconButton Icon={Star} value={reputationScore.toFixed(1)} label="Rep" color="text-yellow-500 bg-yellow-100" />
              </div>
              <div className="flex justify-between items-center">
                <NotificationBell 
                  unreadCount={localUnreadCount} 
                  onClick={handleNotificationClick}
                />
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                {userData?.avatar && (
                  <img 
                    src={getAvatarUrl(userData.avatar)} 
                    alt="User Avatar" 
                    className="h-8 w-8 rounded-full object-cover"
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <NotificationModal 
        isOpen={isNotificationModalOpen} 
        onClose={handleCloseNotificationModal}
      >
        <NotificationList />
      </NotificationModal>
    </header>
  );
};

export default AuthenticatedHeader;