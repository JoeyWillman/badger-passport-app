// src/components/FeedPage.js
import React, { useState, useEffect } from "react";
import { auth } from "../firebaseConfig";
import { toast } from "react-toastify";

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

        // Deduplicate and resolve user/location names
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

  if (loading) return <div className="text-center mt-5">Loading feed...</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">🎉 Friend Feed</h2>
      {feed.length === 0 && <p>No check-ins yet!</p>}

      {feed.map((item) => (
        <div key={item._id} className="card mb-4 p-3 shadow-sm">
          <p>
            <strong>{userNames[item.userId] || item.userId}</strong> checked in at{" "}
            <strong>{locationNames[item.locationId] || item.locationId}</strong>
          </p>
          {item.photoUrl && (
            <img
              src={`/${item.photoUrl}`}
              alt="Check-in"
              className="img-fluid rounded mb-2"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          )}
          <p>{item.caption}</p>
          <small className="text-muted">{new Date(item.timestamp).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}

export default FeedPage;
