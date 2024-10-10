import React from 'react';
import { useNavigate } from 'react-router-dom';
import InitialSkillSelection from '../components/auth/InitialSkillSelection';

const InitialSetup = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate('/dashboard');
  };

  return <InitialSkillSelection onComplete={handleComplete} />;
};

export default InitialSetup;