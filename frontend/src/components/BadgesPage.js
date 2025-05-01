// src/components/BadgesPage.js
import React from "react";
import "./BadgesPage.css";

function BadgesPage({ user }) {
  const allBadges = ["First Check-in", "Halfway There", "All Done"];
  const earnedBadges = new Set(user?.badges || []);

  return (
    <div className="badges-container">
      <h2 className="badges-title">🎖️ Your Passport Badges</h2>
      <div className="badges-grid">
        {allBadges.map((badge) => {
          const earned = earnedBadges.has(badge);
          return (
            <div
              key={badge}
              className={`badge-card ${earned ? "earned" : "locked"}`}
              aria-label={earned ? `Earned badge: ${badge}` : `Locked badge: ${badge}`}
            >
              <div className="badge-icon" title={badge}>
                <span role="img" aria-label="badge">
                  {earned ? "🏅" : "🔒"}
                </span>
              </div>
              <p className="badge-name">{badge}</p>
              {!earned && <p className="badge-locked-label">Locked</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BadgesPage;
