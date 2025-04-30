import React, { useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';
import { toast } from 'react-toastify';

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

        // Reset form
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
    <div className="container mt-4" style={{ maxWidth: "600px" }}>
      <h2 className="mb-3">📍 Check In to a Location</h2>

      {badgeMessage && (
        <div className="alert alert-success">{badgeMessage}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="locationSelect" className="form-label">Location</label>
          <select
            id="locationSelect"
            className="form-select"
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

        <div className="mb-3">
          <label htmlFor="photo" className="form-label">Photo</label>
          <input
            id="photo"
            type="file"
            accept="image/*"
            className="form-control"
            onChange={(e) => setPhotoFile(e.target.files[0])}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="caption" className="form-label">Caption</label>
          <input
            id="caption"
            type="text"
            className="form-control"
            placeholder="Say something about this place"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>

        <button className="btn btn-primary w-100" type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Check-In"}
        </button>
      </form>
    </div>
  );
}

export default CheckInPage;
