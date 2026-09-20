import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

const ROLE_HOME = {
  admin: '/admin/dashboard',
  host: '/host/dashboard',
  user: '/user/dashboard',
};

const RoleRoute = ({ allowedRoles, children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen grid place-items-center text-neutral-500">Cargando panel...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const role = user.role || user.rol;
  if (!allowedRoles.includes(role)) {
    return <Navigate to={ROLE_HOME[role] || '/'} replace />;
  }

  return children;
};

export default RoleRoute;
