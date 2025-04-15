import React from 'react';

function BadgesPage({ user }) {
  const allBadges = ["First Check-in", "Halfway There", "All Done"];

  return (
    <div>
      <h2>My Badges</h2>
      <div className="badges-list">
        {allBadges.map(badge => {
          const earned = user.badges.includes(badge);
          return (
            <div key={badge} className={`badge ${earned ? 'earned' : 'locked'}`}>
              <span>{badge}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BadgesPage;
