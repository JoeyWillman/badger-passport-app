function CheckInPage() {
    const [locationId, setLocationId] = useState("");
    const [caption, setCaption] = useState("");
    const [photoFile, setPhotoFile] = useState(null);
    const [locations, setLocations] = useState([]);
  
    useEffect(() => {
      // fetch locations for dropdown
      fetch('/api/locations').then(res => res.json()).then(data => setLocations(data));
    }, []);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!locationId) {
        alert("Please select a location to check in.");
        return;
      }
      const formData = new FormData();
      formData.append('locationId', locationId);
      formData.append('caption', caption);
      if (photoFile) {
        formData.append('photo', photoFile);
      }
      const token = await auth.currentUser.getIdToken();
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        alert("Check-in successful!");
        // Optionally, redirect to feed or map
      } else {
        alert("Check-in failed. Please try again.");
      }
    };
  
    return (
      <div>
        <h2>Check In to a Location</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Location:
            <select value={locationId} onChange={e => setLocationId(e.target.value)}>
              <option value="">-- Select Location --</option>
              {locations.map(loc => (
                <option key={loc._id} value={loc._id}>{loc.name}</option>
              ))}
            </select>
          </label>
          <br/>
          <label>
            Photo:
            <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} />
          </label>
          <br/>
          <label>
            Caption:
            <input type="text" value={caption} onChange={e => setCaption(e.target.value)} placeholder="Say something about this place" />
          </label>
          <br/>
          <button type="submit">Submit Check-In</button>
        </form>
      </div>
    );
  }
  export default CheckInPage;