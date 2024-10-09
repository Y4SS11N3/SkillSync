import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';

const ConditionalHeader = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  if (isHomePage) {
    return <Header />;
  } else {
    return null;
  }
};

export default ConditionalHeader;