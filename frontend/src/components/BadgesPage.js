import React from "react";
import "./BadgesPage.css"; // optional external styles

function BadgesPage({ user }) {
  const allBadges = ["First Check-in", "Halfway There", "All Done"];
  const earnedBadges = new Set(user?.badges || []);

  return (
    <div className="container mt-4">
      <h2 className="mb-3">🏅 My Badges</h2>
      <div className="row">
        {allBadges.map((badge) => {
          const earned = earnedBadges.has(badge);
          return (
            <div
              key={badge}
              className={`col-md-4 text-center badge-tile ${earned ? "earned" : "locked"}`}
              aria-label={earned ? `Earned badge: ${badge}` : `Locked badge: ${badge}`}
            >
              <div className={`badge-icon ${earned ? "earned" : "locked"}`}>
                {/* Optional: badge icon or emoji */}
                <span role="img" aria-label="badge">🎖️</span>
              </div>
              <p className="badge-name">{badge}</p>
              {!earned && <p className="text-muted">🔒 Locked</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BadgesPage;
