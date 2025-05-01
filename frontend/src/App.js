// src/App.js
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css"; // Add custom styling here

import { auth } from "./firebaseConfig";

// Components
import Navbar from "./components/navbar";
import Login from "./components/Login";
import Signup from "./components/Signup";
import MapPage from "./components/MapPage";
import FeedPage from "./components/FeedPage";
import ChecklistPage from "./components/ChecklistPage";
import BadgesPage from "./components/BadgesPage";
import MyCheckinsPage from "./components/MyCheckinsPage";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setCheckingAuth(false);
    });
    return unsubscribe;
  }, []);

  if (checkingAuth) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <h4 className="text-muted">🔄 Checking authentication...</h4>
      </div>
    );
  }

  return (
    <Router>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        pauseOnFocusLoss
        pauseOnHover
        draggable
        theme="colored"
      />

      {/* Show navbar only when logged in */}
      {user && <Navbar />}

      <main className="app-main">
        <Routes>
          {!user ? (
            <>
              <Route path="/signup" element={<Signup />} />
              <Route path="/*" element={<Login />} />
            </>
          ) : (
            <>
              <Route path="/map" element={<MapPage user={user} />} />
              <Route path="/feed" element={<FeedPage user={user} />} />

              <Route
                path="/checklist"
                element={
                  <PrivateRoute user={user}>
                    <ChecklistPage user={user} />
                  </PrivateRoute>
                }
              />

              <Route
                path="/badges"
                element={
                  <PrivateRoute user={user}>
                    <BadgesPage user={user} />
                  </PrivateRoute>
                }
              />

              <Route
                path="/checkins"
                element={
                  <PrivateRoute user={user}>
                    <MyCheckinsPage user={user} />
                  </PrivateRoute>
                }
              />

              <Route path="*" element={<Navigate to="/map" replace />} />
            </>
          )}
        </Routes>
      </main>
    </Router>
  );
}

export default App;
