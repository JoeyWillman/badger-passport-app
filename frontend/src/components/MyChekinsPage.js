// src/components/MyCheckinsPage.js
import React, { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { toast } from "react-toastify";

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
    return <div className="container mt-5">🔄 Loading your check-ins...</div>;
  }

  if (checkins.length === 0) {
    return <div className="container mt-5">📭 No check-ins yet. Go explore!</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">📸 My Check-ins</h2>

      {checkins.map((entry) => (
        <div key={entry._id} className="feed-item">
          <h5>{entry.locationId?.name || "Unknown location"}</h5>
          <p className="mb-1"><strong>Caption:</strong> {entry.caption || "No caption"}</p>
          {entry.photoUrl && (
            <img
              src={entry.photoUrl}
              alt="Check-in"
              style={{ maxWidth: "100%", borderRadius: "8px", marginBottom: "10px" }}
            />
          )}
          <small className="text-muted">
            {new Date(entry.timestamp || entry.createdAt).toLocaleString()}
          </small>
        </div>
      ))}
    </div>
  );
}

export default MyCheckinsPage;
