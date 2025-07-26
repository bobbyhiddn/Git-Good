import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Walkthrough from './pages/Walkthrough';
import Terminal from './pages/Terminal';
import Tutorials from './pages/Tutorials';
import './styles.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Walkthrough />} />
            <Route path="/terminal" element={<Terminal />} />
            <Route path="/tutorials" element={<Tutorials />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
