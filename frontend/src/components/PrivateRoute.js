// src/components/PrivateRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../firebaseConfig";

function PrivateRoute({ children }) {
  const user = auth.currentUser;

  return user ? children : <Navigate to="/login" />;
}

export default PrivateRoute;
