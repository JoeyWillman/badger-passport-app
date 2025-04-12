import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { auth } from './firebaseConfig';

import Login from './components/Login';
import Signup from './components/Signup';
import MapPage from './components/MapPage';
import FeedPage from './components/FeedPage';
import ChecklistPage from './components/ChecklistPage';
import BadgesPage from './components/BadgesPage';
// Optional:
import LeaderboardPage from './components/LeaderboardPage'; // if implemented

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

  if (!user) {
    // If not logged in, only allow access to login/signup pages
    return (
      <Router>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/*" element={<Login />} />
        </Routes>
      </Router>
    );
  }

  // If logged in, show the main app routes
  return (
    <Router>
      <Routes>
        <Route path="/map" element={<MapPage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/checklist" element={<ChecklistPage user={user} />} />
        <Route path="/badges" element={<BadgesPage user={user} />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} /> {/* optional */}
        <Route path="*" element={<Navigate to="/map" />} />
      </Routes>
    </Router>
  );
}

export default App;
