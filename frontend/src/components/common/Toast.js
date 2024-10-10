import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

const toastTypes = {
  success: {
    icon: CheckCircleIcon,
    className: 'bg-green-500',
  },
  error: {
    icon: XCircleIcon,
    className: 'bg-red-500',
  },
  warning: {
    icon: ExclamationCircleIcon,
    className: 'bg-yellow-500',
  },
  info: {
    icon: InformationCircleIcon,
    className: 'bg-blue-500',
  },
};

const Toast = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
  position = 'bottom-right',
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  const toastType = toastTypes[type] || toastTypes.info;
  const { icon: Icon, className } = toastType;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  const toastContent = (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className={`fixed ${positionClasses[position] || positionClasses['bottom-right']} z-50 flex items-center max-w-md w-full`}
        >
          <div
            className={`${className} text-white p-4 rounded-lg shadow-lg flex items-center space-x-3`}
          >
            <Icon className="h-6 w-6 flex-shrink-0" />
            <p className="flex-grow">{message}</p>
            <button onClick={handleClose} className="flex-shrink-0">
              <XCircleIcon className="h-5 w-5 hover:text-gray-200 transition-colors duration-150" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(toastContent, document.body);
};

export default Toast;