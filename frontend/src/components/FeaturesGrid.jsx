import React from 'react';

const FeaturesGrid = () => {
  const features = [
    {
      icon: '🏢',
      title: 'Centralized Workspace',
      description: 'All your projects, tasks, and team communication in one unified platform.'
    },
    {
      icon: '📊',
      title: 'Crystal-Clear Dashboards',
      description: 'Real-time insights and analytics to track progress and identify bottlenecks.'
    },
    {
      icon: '🎯',
      title: 'Smart Task Assignment',
      description: 'Intelligent task distribution based on team member skills and availability.'
    },
    {
      icon: '⏰',
      title: 'Proactive Deadline Management',
      description: 'Automated reminders and deadline tracking to keep projects on schedule.'
    },
    {
      icon: '💬',
      title: 'Threaded Discussions',
      description: 'Context-aware conversations that keep team communication organized.'
    },
    {
      icon: '📱',
      title: 'Mobile-First Design',
      description: 'Seamless experience across all devices with native mobile apps.'
    }
  ];

  return (
    <section className="features" id="features">
      <div className="features-container">
        <h2>Powerful Features for Modern Teams</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
