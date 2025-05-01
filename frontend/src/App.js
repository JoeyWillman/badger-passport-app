import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { ToastContainer } from 'react-toastify';

import { auth } from './firebaseConfig';

import Navbar from './components/Naavbar';
import Login from './components/Login';
import Signup from './components/Signup';
import MapPage from './components/MapPage';
import FeedPage from './components/FeedPage';
import ChecklistPage from './components/ChecklistPage';
import BadgesPage from './components/BadgesPage';
import MyCheckinsPage from './components/MyCheckinsPage';
import PrivateRoute from './components/PrivateRoute';

import 'react-toastify/dist/ReactToastify.css';

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
      <div className="d-flex justify-content-center align-items-center vh-100">
        <h4>🔄 Checking authentication...</h4>
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
      />

      {user && <Navbar />}

      <div className="container mt-4">
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
                path="/my-checkins"
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
      </div>
    </Router>
  );
}

export default App;
