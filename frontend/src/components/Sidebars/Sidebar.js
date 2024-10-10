import React, { useState, useContext, createContext, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HomeIcon, AcademicCapIcon, CalendarIcon, 
  ChatBubbleLeftIcon, MapIcon, UserCircleIcon,
  ChevronLeftIcon, ArrowLeftOnRectangleIcon,
  ChevronDownIcon, GlobeAltIcon
} from '@heroicons/react/24/solid';
import { logout } from '../../redux/actions/authActions';

const SidebarContext = createContext();

const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

const SidebarProvider = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeItem, setActiveItem] = useState('dashboard');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsExpanded(false);
      } else {
        setIsExpanded(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <SidebarContext.Provider value={{ isExpanded, setIsExpanded, activeItem, setActiveItem }}>
      {children}
    </SidebarContext.Provider>
  );
};

const SidebarItem = ({ icon: Icon, children, id, to, onClick }) => {
  const { isExpanded, setActiveItem } = useSidebar();
  const location = useLocation();
  const isActive = location.pathname === to;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setActiveItem(id);
    }
  };

  return (
    <motion.li
      className={`mb-2 ${isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-700'} rounded-lg overflow-hidden`}
      whileHover={{ backgroundColor: '#E6F3FF' }}
      whileTap={{ scale: 0.95 }}
    >
      <Link
        to={to}
        onClick={handleClick}
        className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors duration-150 ease-in-out ${
          isActive ? 'font-semibold' : ''
        }`}
      >
        <Icon className={`h-5 w-5 flex-shrink-0 ${isExpanded ? 'mr-3' : ''}`} />
        {isExpanded && <span className="truncate">{children}</span>}
      </Link>
    </motion.li>
  );
};

const SidebarSection = ({ title, children }) => {
  const { isExpanded } = useSidebar();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <motion.div 
      className="mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {isExpanded && (
        <motion.div
          className="flex items-center justify-between mb-2 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h3>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-150 ease-in-out"
          >
            <ChevronDownIcon
              className={`h-4 w-4 transform transition-transform duration-150 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </motion.div>
      )}
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Sidebar = () => {
  const { isExpanded, setIsExpanded } = useSidebar();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const sidebarVariants = {
    expanded: { width: '18rem' },
    collapsed: { width: '5rem' }
  };

  return (
    <div className="relative">
      <motion.nav 
        className="bg-white shadow-lg h-screen relative flex flex-col overflow-hidden"
        initial="expanded"
        animate={isExpanded ? "expanded" : "collapsed"}
        variants={sidebarVariants}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className={`p-4 ${isExpanded ? '' : 'px-2'} flex flex-col h-full`}>
          <motion.div 
            className={`flex items-center mb-6 ${isExpanded ? '' : 'justify-center'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {isExpanded ? (
              <>
                <span className="sr-only">SkillSync</span>
                <h1 className="text-2xl font-bold text-blue-600" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Skill<span className="text-blue-800">Sync</span>
                </h1>
              </>
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="flex items-center justify-center w-10 h-10"
              >
                <span className="text-2xl font-bold text-blue-600">S</span>
              </motion.div>
            )}
          </motion.div>

          <div className="flex-grow overflow-y-auto overflow-x-hidden custom-scrollbar">
            <SidebarSection title="Main Menu">
              <SidebarItem icon={HomeIcon} id="dashboard" to="/dashboard">Dashboard</SidebarItem>
              <SidebarItem icon={GlobeAltIcon} id="exchange" to="/exchange">Exchange</SidebarItem>
              <SidebarItem icon={AcademicCapIcon} id="my-skills" to="/my-skills">My Skills</SidebarItem>
              <SidebarItem icon={CalendarIcon} id="exchange-sessions" to="/exchange-sessions">Exchange Sessions</SidebarItem>
              <SidebarItem icon={ChatBubbleLeftIcon} id="chat" to="/chat">Chat</SidebarItem>
              <SidebarItem icon={MapIcon} id="skill-map" to="/skill-map">Global Skill Map</SidebarItem>
            </SidebarSection>
          </div>

          <div className="mt-auto">
            <SidebarItem icon={UserCircleIcon} id="profile" to="/profile">Profile</SidebarItem>
            <SidebarItem 
              icon={ArrowLeftOnRectangleIcon} 
              id="logout" 
              to="/" 
              onClick={handleLogout}
            >
              Log out
            </SidebarItem>
          </div>
        </div>
      </motion.nav>

      <motion.button
        className="absolute top-1/2 -right-3 bg-white rounded-full p-2 shadow-md z-10 md:block hidden"
        style={{
          transform: 'translateY(-50%) translateX(50%)',
        }}
        onClick={toggleSidebar}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial="expanded"
        animate={isExpanded ? "expanded" : "collapsed"}
        variants={{
          expanded: { rotate: 0 },
          collapsed: { rotate: 180 }
        }}
      >
        <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
      </motion.button>
    </div>
  );
};

export { SidebarProvider, Sidebar };