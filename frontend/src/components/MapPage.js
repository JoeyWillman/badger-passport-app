import React, { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

function MapPage({ user }) {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetch('/api/locations')
      .then(res => res.json())
      .then(data => setLocations(data))
      .catch(err => {
        console.error("❌ Error fetching locations:", err);
      });
  }, []);

  const handleCheckIn = async (locationId) => {
    try {
      const token = await user?.getIdToken?.();
      if (!token) throw new Error("User is not authenticated");

      const formData = new FormData();
      formData.append('locationId', locationId);
      formData.append('caption', 'Checked in!');

      await fetch('/api/checkin', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      alert('✅ Check-in successful!');
    } catch (error) {
      console.error('❌ Check-in failed:', error);
      alert('Check-in failed. Please make sure you are logged in.');
    }
  };

  const centerPosition = [43.073051, -89.401230]; // Madison, WI

  return (
    <div className="map-page">
      <h2>Campus Map</h2>
      <MapContainer center={centerPosition} zoom={13} style={{ height: '500px', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((loc) => (
          <Marker key={loc._id} position={[loc.latitude, loc.longitude]}>
            <Popup>
              <b>{loc.name}</b><br />
              {user?.visitedLocations?.includes(loc._id)
                ? '✅ Visited'
                : '📍 Not visited yet'}<br />
              <button
                onClick={() => handleCheckIn(loc._id)}
                disabled={user?.visitedLocations?.includes(loc._id)}
              >
                {user?.visitedLocations?.includes(loc._id) ? "Already Checked In" : "Check in here"}
              </button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default MapPage;
