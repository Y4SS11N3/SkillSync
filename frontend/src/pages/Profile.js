import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// Icon imports
import { 
  UserIcon, LockClosedIcon, AcademicCapIcon, CogIcon,
  PencilIcon, CameraIcon, CheckIcon, BriefcaseIcon
} from '@heroicons/react/24/outline';

// Action imports
import { 
  fetchUserData, 
  updateAvatar,
} from '../redux/actions/userActions';
import { loadUser } from '../redux/actions/authActions';

// Component imports
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';

/**
 * Profile component for displaying and editing user information
 * @returns {JSX.Element} The Profile page component
 */
const Profile = () => {
  const dispatch = useDispatch();
  const { userData, loading, error } = useSelector(state => state.user);
  const { isAuthenticated, loading: authLoading } = useSelector(state => state.auth);

  // State
  const [activeSection, setActiveSection] = useState('basic-info');
  const [editingSections, setEditingSections] = useState({});
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  // Fetch user data
  const fetchData = useCallback(() => {
    if (!isAuthenticated && !authLoading) {
      console.log(`[${new Date().toISOString()}] Dispatching loadUser`);
      dispatch(loadUser());
    } else if (isAuthenticated && !authLoading && !userData) {
      console.log(`[${new Date().toISOString()}] Dispatching fetchUserData`);
      dispatch(fetchUserData());
    }
  }, [isAuthenticated, authLoading, userData, dispatch]);

  useEffect(() => {
    console.log(`[${new Date().toISOString()}] Component mounted or auth state changed`);
    fetchData();
  }, [fetchData]);

  // Event handlers
  const toggleEdit = (section) => {
    setEditingSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleChange = (e, field) => {
    console.log(`Changing ${field}: ${e.target.value}`);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        console.log(`[${new Date().toISOString()}] Updating avatar with file:`, file.name);
        await dispatch(updateAvatar(file));
        console.log(`[${new Date().toISOString()}] Avatar update dispatched`);
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Failed to update avatar:`, error);
      }
    }
  };

  // Sidebar link component
  const SidebarLink = ({ icon: Icon, children, section }) => (
    <motion.button
      onClick={() => setActiveSection(section)}
      className={`flex items-center w-full p-3 rounded-lg transition-colors duration-200 ${
        activeSection === section ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
      }`}
      whileHover={{ x: 5 }}
    >
      <Icon className="h-5 w-5 mr-3" />
      {children}
    </motion.button>
  );

  // Input field component
  const InputField = ({ label, name, value, type = "text", section, onChange }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {editingSections[section] ? (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
        />
      ) : (
        <p className="text-gray-900">{value}</p>
      )}
    </div>
  );

  // Edit button component
  const EditButton = ({ section }) => (
    <button
      onClick={() => toggleEdit(section)}
      className="text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out"
    >
      {editingSections[section] ? (
        <CheckIcon className="h-5 w-5" />
      ) : (
        <PencilIcon className="h-5 w-5" />
      )}
    </button>
  );

  if (loading || authLoading) {
    return <Loader />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.div 
        className="w-64 bg-white shadow-lg"
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="p-6">
          <Link to="/dashboard" className="text-2xl font-bold text-blue-600 mb-6 block hover:text-blue-800 transition duration-150 ease-in-out">
            SkillSync
          </Link>
          <nav className="space-y-2">
            <SidebarLink icon={UserIcon} section="basic-info">Basic Info</SidebarLink>
            <SidebarLink icon={AcademicCapIcon} section="skills">Skills</SidebarLink>
            <SidebarLink icon={BriefcaseIcon} section="education">Education</SidebarLink>
            <SidebarLink icon={LockClosedIcon} section="change-password">Change Password</SidebarLink>
            <SidebarLink icon={CogIcon} section="settings">Settings</SidebarLink>
          </nav>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              {activeSection === 'basic-info' && 'Basic Information'}
              {activeSection === 'skills' && 'Skills'}
              {activeSection === 'education' && 'Education'}
              {activeSection === 'change-password' && 'Change Password'}
              {activeSection === 'settings' && 'Settings'}
            </h2>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeSection === 'basic-info' && userData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="px-6 py-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center">
                  <div className="relative mb-4 sm:mb-0 sm:mr-6">
                    <img 
                      src={userData.avatar}
                      alt={`${userData.name}'s avatar`}
                      className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
                      onError={(e) => {
                        console.error(`[${new Date().toISOString()}] Error loading avatar:`, e);
                        setAvatarLoadError(true);
                      }}
                    />
                    <button 
                      className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition duration-300"
                      onClick={() => document.getElementById('avatar-input').click()}
                    >
                      <CameraIcon className="h-5 w-5" />
                    </button>
                    <input 
                      id="avatar-input"
                      type="file"
                      hidden
                      onChange={handleAvatarChange}
                      accept="image/*"
                    />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-center mb-2">
                      <InputField 
                        label="Name" 
                        name="name" 
                        value={userData?.name} 
                        section="name" 
                        onChange={(e) => handleChange(e, 'name')}
                      />
                      <EditButton section="name" />
                    </div>
                    <div className="flex justify-between items-center">
                      <InputField 
                        label="Title" 
                        name="title" 
                        value={userData?.title} 
                        section="title" 
                        onChange={(e) => handleChange(e, 'title')}
                      />
                      <EditButton section="title" />
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 px-6 py-8 sm:p-10">
                  <div className="flex justify-between items-start mb-4">
                    <InputField 
                      label="About" 
                      name="bio" 
                      value={userData?.bio} 
                      section="bio" 
                      onChange={(e) => handleChange(e, 'bio')}
                    />
                    <EditButton section="bio" />
                  </div>
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    <div className="flex justify-between items-center">
                      <InputField 
                        label="Location" 
                        name="location" 
                        value={userData?.location} 
                        section="location" 
                        onChange={(e) => handleChange(e, 'location')}
                      />
                      <EditButton section="location" />
                    </div>
                    <div className="flex justify-between items-center">
                      <InputField 
                        label="Email" 
                        name="email" 
                        value={userData?.email} 
                        type="email" 
                        section="email" 
                        onChange={(e) => handleChange(e, 'email')}
                      />
                      <EditButton section="email" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {(activeSection === 'skills' || activeSection === 'education' || activeSection === 'change-password' || activeSection === 'settings') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="px-6 py-8 sm:p-10">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</h3>
                  <p>This section is not yet implemented.</p>
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Profile;