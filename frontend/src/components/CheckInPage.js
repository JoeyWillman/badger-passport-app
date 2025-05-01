// src/components/CheckInPage.js
import React, { useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';
import { toast } from 'react-toastify';
import './CheckInPage.css';

function CheckInPage() {
  const [locationId, setLocationId] = useState("");
  const [caption, setCaption] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [locations, setLocations] = useState([]);
  const [badgeMessage, setBadgeMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/locations')
      .then(res => res.json())
      .then(data => setLocations(data))
      .catch(err => {
        console.error("Failed to fetch locations:", err);
        toast.error("Could not load location list.");
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!locationId) {
      toast.warn("Please select a location.");
      return;
    }

    setLoading(true);

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("User not authenticated");

      const formData = new FormData();
      formData.append("locationId", locationId);
      formData.append("caption", caption);
      if (photoFile) formData.append("photo", photoFile);

      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("✅ Check-in successful!");

        if (result.newBadges?.length > 0) {
          const message = `🎉 You earned ${result.newBadges.length > 1 ? 'badges' : 'a badge'}: ${result.newBadges.join(', ')}`;
          setBadgeMessage(message);
          window.scrollTo({ top: 0, behavior: "smooth" });

          setTimeout(() => setBadgeMessage(""), 5000);
        }

        setLocationId("");
        setCaption("");
        setPhotoFile(null);
      } else {
        toast.error(result.error || "❌ Check-in failed.");
      }
    } catch (err) {
      console.error("Check-in error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkin-container">
      <h2 className="checkin-header">📍 Check In to a Location</h2>

      {badgeMessage && (
        <div className="badge-alert">
          {badgeMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="locationSelect">📌 Location</label>
          <select
            id="locationSelect"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            required
          >
            <option value="">-- Select a location --</option>
            {locations.map(loc => (
              <option key={loc._id} value={loc._id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="photo">📷 Upload Photo</label>
          <input
            id="photo"
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoFile(e.target.files[0])}
          />
        </div>

        <div className="form-group">
          <label htmlFor="caption">💬 Caption</label>
          <input
            id="caption"
            type="text"
            placeholder="Say something about this place"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Check In"}
        </button>
      </form>
    </div>
  );
}

export default CheckInPage;
