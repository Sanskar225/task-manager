import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const PrivateRoute = ({ allowedRoles = [] }) => {
  const location = useLocation();
  const userString = localStorage.getItem("user");
  const token = localStorage.getItem("token");

  // If no token or user data exists, redirect to login
  if (!token || !userString) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  try {
    const user = JSON.parse(userString);

    // If roles are specified and user's role is not in allowed roles, redirect to appropriate dashboard
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      const redirectPath =
        user.role === "admin" ? "/admin/dashboard" : "/user/dashboard";
      return <Navigate to={redirectPath} replace />;
    }

    // Allow access to the route
    return <Outlet />;
  } catch (error) {
    // If user data is corrupted, clear storage and redirect to login
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
};

export default PrivateRoute;
