// src/components/MyCheckinsPage.js
import React, { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { toast } from "react-toastify";
import "./MyCheckinsPage.css";

function MyCheckinsPage() {
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCheckins = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) throw new Error("Not authenticated");

        const res = await fetch("/api/checkin/my", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (res.ok) {
          setCheckins(data);
        } else {
          throw new Error(data.error || "Failed to load check-ins");
        }
      } catch (err) {
        console.error("❌ Error fetching check-ins:", err);
        toast.error(err.message || "Could not load your check-ins.");
      } finally {
        setLoading(false);
      }
    };

    fetchCheckins();
  }, []);

  if (loading) {
    return <div className="checkins-container">🔄 Loading your check-ins...</div>;
  }

  if (checkins.length === 0) {
    return <div className="checkins-container">📭 No check-ins yet. Go explore!</div>;
  }

  return (
    <div className="checkins-container">
      <h2 className="checkins-title">📸 My Check-ins</h2>

      {checkins.map((entry) => (
        <div key={entry._id} className="checkin-card">
          <h5 className="checkin-location">
            {entry.locationId?.name || "Unknown location"}
          </h5>
          <p><strong>📝 Caption:</strong> {entry.caption || "No caption"}</p>
          {entry.photoUrl && (
            <img
              src={entry.photoUrl}
              alt="Check-in"
              className="checkin-image"
            />
          )}
          <small className="checkin-date">
            {new Date(entry.timestamp || entry.createdAt).toLocaleString()}
          </small>
        </div>
      ))}
    </div>
  );
}

export default MyCheckinsPage;
