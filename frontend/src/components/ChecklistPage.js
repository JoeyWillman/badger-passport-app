// src/components/ChecklistPage.js
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

function ChecklistPage({ user }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visited, setVisited] = useState(new Set());

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/locations", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setLocations(data);
        setVisited(new Set(user.visitedLocations || []));
      } catch (err) {
        console.error("Failed to fetch locations:", err);
        toast.error("Could not load checklist.");
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [user]);

  const toggleVisited = async (locId) => {
    const newVisited = new Set(visited);
    const isVisited = visited.has(locId);

    if (isVisited) {
      newVisited.delete(locId);
    } else {
      newVisited.add(locId);
    }

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
      toast.success(isVisited ? "Location unchecked." : "Location checked!");
    } catch (err) {
      toast.error("Could not update visit.");
    }
  };

  if (loading) return <div className="text-center mt-5">📘 Loading your checklist...</div>;

  return (
    <div className="passport-container">
      <h2 className="passport-header">🛂 UW Passport Checklist</h2>
      <ul className="passport-checklist">
        {locations.map((loc) => (
          <ChecklistItem
            key={loc._id}
            loc={loc}
            visited={visited.has(loc._id)}
            onToggle={() => toggleVisited(loc._id)}
          />
        ))}
      </ul>
    </div>
  );
}

function ChecklistItem({ loc, visited, onToggle }) {
  return (
    <li className={`passport-item ${visited ? "checked" : ""}`}>
      <label>
        <input
          type="checkbox"
          checked={visited}
          onChange={onToggle}
        />
        <span>{loc.name}</span>
      </label>
    </li>
  );
}

export default ChecklistPage;
