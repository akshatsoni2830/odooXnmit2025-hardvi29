import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FeaturesGrid from '../components/FeaturesGrid';
import Stats from '../components/Stats';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <FeaturesGrid />
      <Stats />
      <Footer />
    </div>
  );
};

export default Home;
