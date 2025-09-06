import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-container">
        <h1>Where teams work smarter, stay aligned, and continuously improve</h1>
        <p>
          SynergySphere is the ultimate collaboration platform that transforms how teams 
          manage projects, track progress, and achieve their goals together.
        </p>
        <div className="hero-buttons">
          <Link to="/signup" className="btn btn-primary">Get Started Free</Link>
          <Link to="/projects" className="btn btn-outline">View Demo</Link>
        </div>
        <img 
          src="/hero.png" 
          alt="SynergySphere Dashboard" 
          className="hero-image"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>
    </section>
  );
};

export default Hero;
