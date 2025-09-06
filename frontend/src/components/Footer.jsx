import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p>&copy; 2024 SynergySphere. All rights reserved.</p>
        <div style={{ marginTop: '1rem' }}>
          <a href="#privacy" style={{ color: 'white', marginRight: '1rem' }}>Privacy</a>
          <a href="#terms" style={{ color: 'white', marginRight: '1rem' }}>Terms</a>
          <a href="#contact" style={{ color: 'white' }}>Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
