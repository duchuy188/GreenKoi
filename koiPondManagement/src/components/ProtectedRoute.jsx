import React, { useEffect, useState, useMemo } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ allowedRoles }) => {
  const user = useSelector((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);

  const hasAccess = useMemo(() => {
    if (!user || !user.roleId) return false;
    return allowedRoles.includes(Number(user.roleId));
  }, [user, allowedRoles]);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default React.memo(ProtectedRoute);
