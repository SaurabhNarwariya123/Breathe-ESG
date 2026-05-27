import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const PrivateRoute = ({ children }) => {
  const token = useAuthStore((s) => s.token);
  return token ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
