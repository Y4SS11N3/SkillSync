import React from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';

const ConditionalSidebar = () => {
  const location = useLocation();
  const noSidebarRoutes = ['/', '/login', '/register', '/auth'];

  if (noSidebarRoutes.includes(location.pathname)) {
    return null;
  }

  return <Sidebar />;
};

export default ConditionalSidebar;