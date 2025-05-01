// src/components/ChecklistPage.js
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

function ChecklistPage({ user }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visited, setVisited] = useState(new Set());
  const [grouped, setGrouped] = useState({});

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/locations", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        const groupedByCategory = data.reduce((acc, loc) => {
          const category = loc.category || "Uncategorized";
          if (!acc[category]) acc[category] = [];
          acc[category].push(loc);
          return acc;
        }, {});

        setGrouped(groupedByCategory);
        setLocations(data);
        setVisited(new Set(user.visitedLocations || []));
      } catch (err) {
        console.error("Checklist load error:", err);
        toast.error("Failed to load checklist.");
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [user]);

  const toggleVisited = async (locId) => {
    const isVisited = visited.has(locId);
    const newVisited = new Set(visited);
    isVisited ? newVisited.delete(locId) : newVisited.add(locId);
    setVisited(newVisited);

    try {
      const token = await user.getIdToken();
      await fetch(`/api/users/visit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ locationId: locId }),
      });
      toast.success(isVisited ? "Location unchecked." : "Checked in!");
    } catch (err) {
      toast.error("Update failed.");
    }
  };

  if (loading) return <div className="text-center mt-5">📘 Loading your checklist...</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4 passport-header">📍 UW Passport Checklist</h2>

      {Object.keys(grouped).sort().map((category) => (
        <div key={category} className="mb-5">
          <h4 className="text-primary border-bottom pb-2 mb-3">{category}</h4>
          <ul className="list-group">
            {grouped[category].map((loc) => (
              <ChecklistItem
                key={loc._id}
                loc={loc}
                visited={visited.has(loc._id)}
                onToggle={() => toggleVisited(loc._id)}
              />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function ChecklistItem({ loc, visited, onToggle }) {
  return (
    <li className="list-group-item d-flex align-items-center">
      <input
        type="checkbox"
        className="form-check-input me-2"
        checked={visited}
        onChange={onToggle}
      />
      <span className={visited ? "text-success fw-semibold" : ""}>
        {loc.name}
      </span>
    </li>
  );
}

export default ChecklistPage;
