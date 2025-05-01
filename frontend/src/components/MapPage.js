import React, { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { auth } from '../firebaseConfig';
import { toast } from 'react-toastify';

function MapPage({ user }) {
  const [locations, setLocations] = useState([]);
  const [visited, setVisited] = useState(new Set(user?.visitedLocations || []));
  const [badgeMessage, setBadgeMessage] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState({});

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch('https://badger-passport-app.onrender.com/api/locations');
        const data = await res.json();
        setLocations(data);
      } catch (err) {
        console.error("❌ Error fetching locations:", err);
        toast.error("Failed to load map locations.");
      }
    };
    fetchLocations();
  }, []);

  const handlePhotoChange = (locationId, file) => {
    setSelectedPhotos((prev) => ({
      ...prev,
      [locationId]: file
    }));
  };

  const handleCheckIn = async (locationId) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("User not authenticated");

      const formData = new FormData();
      formData.append("locationId", locationId);
      formData.append("caption", "Checked in!");
      if (selectedPhotos[locationId]) {
        formData.append("photo", selectedPhotos[locationId]);
      }

      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        setVisited((prev) => new Set(prev).add(locationId));
        toast.success("📸 Check-in successful!");

        if (result.newBadges?.length > 0) {
          const msg = `🎉 You earned ${result.newBadges.length > 1 ? 'badges' : 'a badge'}: ${result.newBadges.join(', ')}`;
          setBadgeMessage(msg);
          setTimeout(() => setBadgeMessage(""), 5000);
        }
      } else {
        toast.error(result.error || "Check-in failed.");
      }
    } catch (error) {
      console.error("❌ Check-in failed:", error);
      toast.error("Check-in failed. Try again.");
    }
  };

  const centerPosition = [43.073051, -89.401230]; // Madison, WI

  return (
    <div className="container mt-4">
      <h2 className="mb-3">🗺️ Campus Map</h2>

      {badgeMessage && (
        <div className="alert alert-success">{badgeMessage}</div>
      )}

      <MapContainer center={centerPosition} zoom={13} style={{ height: '500px', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations
          .map(loc => {
            // Normalize coordinate structure
            const lat = loc.coords?.lat || loc.lat;
            const lng = loc.coords?.lng || loc.long || loc.lon;
            if (typeof lat !== 'number' || typeof lng !== 'number') return null;

            return (
              <Marker key={loc._id} position={[lat, lng]}>
                <Popup>
                  <b>{loc.name}</b><br />
                  {visited.has(loc._id) ? '✅ Visited' : '📍 Not visited yet'}<br />
                  {!visited.has(loc._id) && (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control mt-2"
                        onChange={(e) => handlePhotoChange(loc._id, e.target.files[0])}
                      />
                      <button
                        className="btn btn-sm btn-primary mt-2"
                        onClick={() => handleCheckIn(loc._id)}
                      >
                        Check in with photo
                      </button>
                    </>
                  )}
                  {visited.has(loc._id) && (
                    <button
                      className="btn btn-sm btn-secondary mt-2"
                      disabled
                    >
                      Already Checked In
                    </button>
                  )}
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
}

export default MapPage;
