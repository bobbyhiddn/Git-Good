import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          Git Good
        </Link>
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            Walkthrough
          </Link>
          <Link 
            to="/terminal" 
            className={`nav-link ${isActive('/terminal') ? 'active' : ''}`}
          >
            Terminal
          </Link>
          <Link 
            to="/tutorials" 
            className={`nav-link ${isActive('/tutorials') ? 'active' : ''}`}
          >
            Tutorials
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;