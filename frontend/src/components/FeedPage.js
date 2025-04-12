function FeedPage() {
    const [feed, setFeed] = useState([]);
    useEffect(() => {
      const loadFeed = async () => {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch('/api/feed', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setFeed(data);
      };
      loadFeed();
    }, []);
  
    return (
      <div>
        <h2>Friend Feed</h2>
        {feed.map(item => (
          <div key={item._id} className="feed-item">
            {/* You might need to fetch friend names and location names, or store them in item */}
            <p><strong>{item.userId}</strong> checked in at <strong>{item.locationId}</strong></p>
            {item.photoUrl && <img src={`/${item.photoUrl}`} alt="check-in photo" />}
            <p>{item.caption}</p>
            <small>{new Date(item.timestamp).toLocaleString()}</small>
          </div>
        ))}
      </div>
    );
  }
  