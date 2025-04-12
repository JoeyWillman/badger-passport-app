import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

function MapPage() {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetch('/api/locations')
      .then(res => res.json())
      .then(data => setLocations(data));
  }, []);

  // Set a default center, e.g., UW–Madison coordinates
  const centerPosition = [43.073051, -89.401230]; // lat, lng for Madison, WI
  return (
    <div className="map-page">
      <h2>Campus Map</h2>
      <MapContainer center={centerPosition} zoom={13} style={{ height: '500px', width: '100%' }}>
        <TileLayer 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
        />
        {locations.map(loc => (
          <Marker key={loc._id} position={[loc.latitude, loc.longitude]}>
            <Popup>
              <b>{loc.name}</b><br />
              {user.visitedLocations.includes(loc._id) ? "✅ Visited" : "📍 Not visited yet"}<br/>
              <button onClick={() => handleCheckIn(loc._id)}>Check in here</button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
