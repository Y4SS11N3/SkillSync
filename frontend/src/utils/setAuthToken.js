import axios from 'axios';

const setAuthToken = token => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('accessToken', token);
  } else {
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('accessToken');
  }
};

export default setAuthToken;