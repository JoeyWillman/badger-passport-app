// src/components/FeedPage.js
import React, { useState, useEffect } from "react";
import { auth } from "../firebaseConfig";
import { toast } from "react-toastify";
import "./FeedPage.css";

function FeedPage() {
  const [feed, setFeed] = useState([]);
  const [userNames, setUserNames] = useState({});
  const [locationNames, setLocationNames] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeed = async () => {
      try {
        if (!auth.currentUser) return toast.error("User not authenticated.");
        const token = await auth.currentUser.getIdToken();

        const res = await fetch("/api/feed", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to load feed");

        const data = await res.json();
        setFeed(data);

        const userIds = [...new Set(data.map((item) => item.userId))];
        const locationIds = [...new Set(data.map((item) => item.locationId))];

        const [userMap, locationMap] = await Promise.all([
          resolveNames(userIds, "/api/users/lookup", token),
          resolveNames(locationIds, "/api/locations", token),
        ]);

        setUserNames(userMap);
        setLocationNames(locationMap);
      } catch (err) {
        console.error("Feed error:", err);
        toast.error("Failed to load feed.");
      } finally {
        setLoading(false);
      }
    };

    loadFeed();
  }, []);

  const resolveNames = async (ids, baseUrl, token) => {
    const map = {};
    await Promise.all(
      ids.map(async (id) => {
        const res = await fetch(`${baseUrl}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          map[id] = data.name;
        }
      })
    );
    return map;
  };

  if (loading) return <div className="feed-container text-center">📮 Loading feed...</div>;

  return (
    <div className="feed-container">
      <h2 className="feed-title">📬 Friends’ Passport Feed</h2>
      {feed.length === 0 ? (
        <p className="feed-empty">No check-ins yet. Time to explore! 🌎</p>
      ) : (
        feed.map((item) => (
          <div key={item._id} className="feed-card">
            <p className="feed-heading">
              <strong>{userNames[item.userId] || "Anonymous"}</strong> checked in at{" "}
              <strong>{locationNames[item.locationId] || "Somewhere"}</strong>
            </p>
            {item.photoUrl && (
              <img
                src={`/${item.photoUrl}`}
                alt="Check-in"
                className="feed-image"
              />
            )}
            <p className="feed-caption">{item.caption}</p>
            <p className="feed-timestamp">
              {new Date(item.timestamp).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default FeedPage;
