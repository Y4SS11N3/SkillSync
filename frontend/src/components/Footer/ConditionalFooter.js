import React from 'react';
import { useLocation } from 'react-router-dom';
import Footer from './Footer';

const ConditionalFooter = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  if (isHomePage) {
    return <Footer />;
  } else {
    return null;
  }
};

export default ConditionalFooter;
