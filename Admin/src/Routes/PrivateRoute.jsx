import { Navigate } from 'react-router';
import { isLoggedIn } from '../auth';

// Renders the protected element only when there's a valid, unexpired admin token
function PrivateRoute({ element }) {
  if (!isLoggedIn()) {
    return <Navigate to="/admin" replace />;
  }
  return element;
}

export default PrivateRoute;
