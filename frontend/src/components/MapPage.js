// src/components/MapPage.js
import React, { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { auth } from '../firebaseConfig';
import { toast } from 'react-toastify';
import './MapPage.css';

const API = 'https://badger-passport-app.onrender.com';

export default function MapPage({ user }) {
  const [locations, setLocations] = useState([]);
  const [visited, setVisited] = useState(new Set(user?.visitedLocations || []));
  const [badgeMessage, setBadgeMessage] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState({});

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch(`${API}/api/locations`);
        if (!res.ok) throw new Error('Failed to fetch locations');
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
    setSelectedPhotos(prev => ({ ...prev, [locationId]: file }));
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

      const res = await fetch(`${API}/api/checkin`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const result = await res.json();

      if (res.ok) {
        setVisited(prev => new Set(prev).add(locationId));
        toast.success("📸 Check-in successful!");
        if (result.newBadges?.length) {
          const msg = `🎉 Badge${result.newBadges.length > 1 ? 's' : ''} earned: ${result.newBadges.join(', ')}`;
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
    <div className="map-container">
      <h2 className="map-title">🗺️ Explore Campus</h2>
      {badgeMessage && <div className="badge-alert">{badgeMessage}</div>}

      <MapContainer
        center={centerPosition}
        zoom={13}
        className="leaflet-map"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {locations.map(loc => {
          const lat = loc.coords?.lat ?? loc.lat;
          const lng = loc.coords?.lng ?? loc.long ?? loc.lon;
          if (typeof lat !== 'number' || typeof lng !== 'number') return null;

          const isVisited = visited.has(loc._id);

          return (
            <CircleMarker
              key={loc._id}
              center={[lat, lng]}
              radius={isVisited ? 10 : 8}
              pathOptions={{
                color: isVisited ? 'green' : 'blue',
                fillColor: isVisited ? 'green' : 'blue',
                fillOpacity: 0.8,
                weight: 2,
              }}
            >
              <Popup>
                <strong>{loc.name}</strong><br />
                {isVisited ? '✅ Visited' : '📍 Not visited yet'}<br />
                {!isVisited ? (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control mt-2"
                      onChange={e => handlePhotoChange(loc._id, e.target.files[0])}
                    />
                    <button
                      className="btn btn-sm btn-primary mt-2"
                      onClick={() => handleCheckIn(loc._id)}
                    >
                      Check in with photo
                    </button>
                  </>
                ) : (
                  <button className="btn btn-sm btn-secondary mt-2" disabled>
                    Already Checked In
                  </button>
                )}
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
