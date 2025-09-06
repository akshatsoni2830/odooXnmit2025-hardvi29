import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Projects from './pages/Projects';

export default function App() {
  return (
    <div style={{ padding: 28, fontFamily: 'Inter,system-ui,Arial' }}>
      <header style={{ marginBottom: 20 }}>
        <h1>SynergySphere — MVP</h1>
        <nav style={{ marginTop: 8 }}>
          <Link to="/" style={{ marginRight: 12 }}>Home</Link>
          <Link to="/login" style={{ marginRight: 12 }}>Login</Link>
          <Link to="/signup" style={{ marginRight: 12 }}>Sign up</Link>
          <Link to="/projects">Projects</Link>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/projects" element={<Projects />} />
        </Routes>
      </main>
    </div>
  );
}

function Home() {
  return (
    <div>
      <h2>Welcome to SynergySphere</h2>
      <p>Advanced Team Collaboration Platform</p>
      <div style={{ marginTop: 20 }}>
        <p><Link to="/login">Login</Link> to access your account</p>
        <p><Link to="/signup">Sign up</Link> to create a new account</p>
        <p><Link to="/projects">Projects</Link> to view and manage your projects</p>
      </div>
      <p style={{ marginTop: 20, fontSize: 14, color: '#666' }}>
        Server health endpoint: <code>http://localhost:4000/health</code>
      </p>
    </div>
  );
}