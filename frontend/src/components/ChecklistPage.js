function ChecklistPage() {
    const [locations, setLocations] = useState([]);
    useEffect(() => {
      fetch('/api/locations')
        .then(res => res.json())
        .then(data => setLocations(data));
    }, []);
    const visitedSet = new Set(user.visitedLocations);  // assuming user from context or prop
    return (
      <div>
        <h2>My Checklist</h2>
        <ul>
          {locations.map(loc => (
            <li key={loc._id}>
              <input type="checkbox" checked={visitedSet.has(loc._id)} readOnly />
              {visitedSet.has(loc._id) ? <s>{loc.name}</s> : loc.name}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  