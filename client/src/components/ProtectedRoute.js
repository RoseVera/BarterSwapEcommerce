import React from 'react';
import { Navigate } from "react-router-dom";
import useUserStore from "./UserStore";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = useUserStore((state) => state.user);
  const isUserChecked = useUserStore((state) => state.isUserChecked);

  if (!isUserChecked) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; 
  }

  return children;
};

export default ProtectedRoute;
