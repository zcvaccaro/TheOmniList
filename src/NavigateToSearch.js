import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NavigateToSearch = ({ onNavigate }) => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/search');
    onNavigate(); // Callback to reset the navigation trigger
  }, [navigate, onNavigate]);

  return null; // This component does not render anything
};

export default NavigateToSearch;