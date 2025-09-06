import React from 'react';

const Stats = () => {
  const stats = [
    { number: '500+', label: 'Teams' },
    { number: '99.9%', label: 'Uptime' },
    { number: '2x', label: 'Faster Delivery' },
    { number: '40%', label: 'Time Saved' }
  ];

  return (
    <section className="stats">
      <div className="stats-container">
        <h2>Trusted by Teams Worldwide</h2>
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
