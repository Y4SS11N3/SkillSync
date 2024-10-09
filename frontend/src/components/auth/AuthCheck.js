import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loadUser } from '../../redux/actions/authActions';
import setAuthToken from '../../utils/setAuthToken';

function AuthCheck() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setAuthToken(token);
      dispatch(loadUser());
    }
  }, [dispatch]);

  return null;
}

export default AuthCheck;