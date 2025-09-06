import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="brand">
          SynergySphere
        </Link>
        
        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#about">About</a></li>
        </ul>
        
        <div className="nav-buttons">
          <Link to="/login" className="btn btn-outline">Sign in</Link>
          <Link to="/signup" className="btn btn-primary">Get Started</Link>
          <Link to="/projects" className="btn btn-outline">Projects</Link>
          <Link to="/profile" className="btn btn-outline">Profile</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
