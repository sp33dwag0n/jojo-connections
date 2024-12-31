import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';  // Correct import

const PrivateRoute = ({ element, ...rest }) => {
  const token = localStorage.getItem('authToken');  // Retrieve the token from localStorage

  // If no token, or the token is expired, redirect to the login page
  if (!token) {
    console.log("Login first!");
    return <Navigate to="/admin" />;
  }

  try {
    const decodedToken = jwtDecode(token);  // Decode the JWT token correctly
    const expirationTime = decodedToken.exp * 1000;  // Convert exp to milliseconds
    const currentTime = Date.now();

    // If the token is expired, remove it and redirect to the login page
    if (currentTime > expirationTime) {
      localStorage.removeItem('authToken');
      return <Navigate to="/admin" />;
    }
  } catch (error) {
    // In case of error (e.g., invalid token), redirect to the login page
    return <Navigate to="/admin" />;
  }

  // If the user is authenticated and the token is valid, render the protected route
  return element;  // Render the protected component directly
};

export default PrivateRoute;
