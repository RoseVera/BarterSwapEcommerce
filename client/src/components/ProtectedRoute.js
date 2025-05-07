import React, { useEffect } from 'react';
import axios from 'axios';
import { Navigate } from "react-router-dom";
import useUserStore from "./UserStore"; // yolunu senin projene göre düzenle

const ProtectedRoute = ({ children }) => {
  const user = useUserStore((state) => state.user);
  const isUserChecked = useUserStore((state) => state.isUserChecked);

  if (!isUserChecked) {
    return <div>Loading...</div>; // veya boş bir fragment dönebilirsin
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;