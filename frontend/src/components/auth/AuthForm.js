import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, register } from '../../redux/actions/authActions';
import { motion, AnimatePresence } from 'framer-motion';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { ReactComponent as LoginSVG } from '../../svg/undraw_login_re_4vu2.svg';
import { ReactComponent as RegisterSVG } from '../../svg/undraw_sign_up_n6im.svg';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaFacebookF, FaLinkedinIn, FaApple } from 'react-icons/fa';

// Custom Google SVG component
const GoogleSVG = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path d="M12,5c1.6167603,0,3.1012573,0.5535278,4.2863159,1.4740601l3.637146-3.4699707   C17.8087769,1.1399536,15.0406494,0,12,0C7.392395,0,3.3966675,2.5999146,1.3858032,6.4098511l4.0444336,3.1929321   C6.4099731,6.9193726,8.977478,5,12,5z" fill="#F44336"/>
    <path d="M23.8960571,13.5018311C23.9585571,13.0101929,24,12.508667,24,12   c0-0.8578491-0.093689-1.6931763-0.2647705-2.5H12v5h6.4862061c-0.5247192,1.3637695-1.4589844,2.5177612-2.6481934,3.319458   l4.0594482,3.204834C22.0493774,19.135437,23.5219727,16.4903564,23.8960571,13.5018311z" fill="#2196F3"/>
    <path d="M5,12c0-0.8434448,0.1568604-1.6483765,0.4302368-2.3972168L1.3858032,6.4098511   C0.5043335,8.0800171,0,9.9801636,0,12c0,1.9972534,0.4950562,3.8763428,1.3582153,5.532959l4.0495605-3.1970215   C5.1484375,13.6044312,5,12.8204346,5,12z" fill="#FFC107"/>
    <path d="M12,19c-3.0455322,0-5.6295776-1.9484863-6.5922241-4.6640625L1.3582153,17.532959   C3.3592529,21.3734741,7.369812,24,12,24c3.027771,0,5.7887573-1.1248169,7.8974609-2.975708l-4.0594482-3.204834   C14.7412109,18.5588989,13.4284058,19,12,19z" fill="#00B060"/>
  </svg>
);

const AuthForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(location.pathname === '/login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { isAuthenticated, user } = useSelector(state => state.auth);

  const dispatch = useDispatch();

  useEffect(() => {
    setIsLogin(location.pathname === '/login');
  }, [location]);

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    if (!isLogin) {
      if (!name) newErrors.name = 'Name is required';
      if (!confirmPassword) newErrors.confirmPassword = 'Confirm Password is required';
      if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    console.log('Auth state updated:', { isAuthenticated, user });
    if (isAuthenticated && user) {
      console.log('User authenticated:', user);
      if (!user.initialSetupComplete && location.pathname !== '/initial-setup') {
        console.log('Redirecting to initial setup');
        navigate('/initial-setup');
      } else if (user.initialSetupComplete && location.pathname !== '/dashboard') {
        console.log('Redirecting to dashboard');
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        if (isLogin) {
          await dispatch(login(email, password));
        } else {
          await dispatch(register(name, email, password));
        }
        console.log('Auth action completed');
      } catch (error) {
        console.error('Auth error:', error);
        setErrors({ ...errors, form: error.response?.data?.error || 'An error occurred' });
      }
    }
  };

  const switchMode = () => {
    const newMode = !isLogin;
    setIsLogin(newMode);
    navigate(newMode ? '/login' : '/register', { replace: true });
    setErrors({});
    setPassword('');
    setConfirmPassword('');
  };

  const formVariants = {
    hidden: { opacity: 0, x: isLogin ? -100 : 100 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: isLogin ? 100 : -100 }
  };

  const svgVariants = {
    hidden: { opacity: 0, x: isLogin ? 100 : -100 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: isLogin ? -100 : 100 }
  };

  const SocialLoginButtons = () => (
    <div className="mt-6">
      <p className="text-center text-sm text-gray-500 mb-4">Or continue with</p>
      <div className="flex justify-center space-x-4">
        <button className="p-2 rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-colors">
          <GoogleSVG />
        </button>
        <button className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors">
          <FaFacebookF className="w-5 h-5" />
        </button>
        <button className="p-2 rounded-full bg-blue-700 text-white hover:bg-blue-800 transition-colors">
          <FaLinkedinIn className="w-5 h-5" />
        </button>
        <button className="p-2 rounded-full bg-black text-white hover:bg-gray-800 transition-colors">
          <FaApple className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#e6f3ff] to-[#f0e6ff] dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl flex w-full max-w-5xl overflow-hidden">
        <AnimatePresence mode="wait">
          {isLogin ? (
            <>
              <motion.div 
                key="login-form"
                className="w-full md:w-1/2 p-10 md:p-16"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-4xl font-bold text-[#0088cc] dark:text-white mb-8">Welcome Back</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-200 block mb-2">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0088cc] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="you@example.com"
                    />
                    {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                  </div>
                  <div className="relative">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-200 block mb-2">Password</label>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0088cc] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center top-6"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
                  </div>
                  <motion.button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0088cc] hover:bg-[#006699] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0088cc]"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign In
                  </motion.button>
                </form>
                <SocialLoginButtons />
                <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  Don't have an account?{' '}
                  <button
                    onClick={switchMode}
                    className="font-medium text-[#0088cc] hover:text-[#006699] dark:text-[#0088cc] dark:hover:text-[#006699]"
                  >
                    Sign up now
                  </button>
                </p>
              </motion.div>
              <motion.div
                key="login-svg"
                className="hidden md:flex md:w-1/2 bg-[#0088cc] items-center justify-center p-16"
                variants={svgVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.5 }}
              >
                <LoginSVG className="w-full h-auto max-w-md" />
              </motion.div>
            </>
          ) : (
            <>
              <motion.div
                key="register-svg"
                className="hidden md:flex md:w-1/2 bg-[#006699] items-center justify-center p-16"
                variants={svgVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.5 }}
              >
                <RegisterSVG className="w-full h-auto max-w-md" />
              </motion.div>
              <motion.div 
                key="register-form"
                className="w-full md:w-1/2 p-10 md:p-16"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-4xl font-bold text-[#006699] dark:text-white mb-8">Create Account</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-200 block mb-2">Full Name</label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006699] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="John Doe"
                    />
                    {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-200 block mb-2">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006699] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="you@example.com"
                    />
                    {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                  </div>
                  <div className="relative">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-200 block mb-2">Password</label>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006699] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center top-6"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
                  </div>
                  <div className="relative">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-200 block mb-2">Confirm Password</label>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006699] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center top-6"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>}
                  </div>
                  <motion.button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#006699] hover:bg-[#005580] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#006699]"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign Up
                  </motion.button>
                </form>
                <SocialLoginButtons />
                <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  Already have an account?{' '}
                  <button
                    onClick={switchMode}
                    className="font-medium text-[#006699] hover:text-[#005580] dark:text-[#0088cc] dark:hover:text-[#006699]"
                  >
                    Sign in
                  </button>
                </p>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Copyright notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 w-full max-w-5xl mx-auto"
      >
        <p>&copy; 2024 SkillSync. All rights reserved.</p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          Empowering skills exchange worldwide
        </motion.p>
      </motion.div>
    </div>
  );
};

export default AuthForm;