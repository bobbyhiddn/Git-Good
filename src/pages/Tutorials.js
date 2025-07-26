import React from 'react';

const Tutorials = () => {
  return (
    <div className="tutorials-page">
      <div className="tutorials-header">
        <h1>Git Tutorials</h1>
        <p>Learn Git through interactive challenges and scenarios.</p>
      </div>
      
      <div className="tutorials-grid">
        <div className="tutorial-card">
          <h3>Your First Commit</h3>
          <p>Learn the basics: init, add, and commit your first changes.</p>
          <div className="tutorial-meta">
            <span className="difficulty beginner">Beginner</span>
            <span className="duration">5 min</span>
          </div>
          <button className="tutorial-button">Start Tutorial</button>
        </div>

        <div className="tutorial-card">
          <h3>Branching and Merging</h3>
          <p>Master branch creation, switching, and merging workflows.</p>
          <div className="tutorial-meta">
            <span className="difficulty intermediate">Intermediate</span>
            <span className="duration">10 min</span>
          </div>
          <button className="tutorial-button">Start Tutorial</button>
        </div>

        <div className="tutorial-card">
          <h3>Fixing Merge Conflicts</h3>
          <p>Learn how to resolve conflicts when merging branches.</p>
          <div className="tutorial-meta">
            <span className="difficulty intermediate">Intermediate</span>
            <span className="duration">15 min</span>
          </div>
          <button className="tutorial-button">Start Tutorial</button>
        </div>

        <div className="tutorial-card">
          <h3>Collaborative Workflow</h3>
          <p>Practice working with remotes, pull requests, and team workflows.</p>
          <div className="tutorial-meta">
            <span className="difficulty advanced">Advanced</span>
            <span className="duration">20 min</span>
          </div>
          <button className="tutorial-button">Start Tutorial</button>
        </div>

        <div className="tutorial-card">
          <h3>Stashing and Cleaning</h3>
          <p>Learn to temporarily save work and clean your working directory.</p>
          <div className="tutorial-meta">
            <span className="difficulty beginner">Beginner</span>
            <span className="duration">8 min</span>
          </div>
          <button className="tutorial-button">Start Tutorial</button>
        </div>

        <div className="tutorial-card">
          <h3>Rewriting History</h3>
          <p>Master rebasing, squashing, and other history manipulation techniques.</p>
          <div className="tutorial-meta">
            <span className="difficulty advanced">Advanced</span>
            <span className="duration">25 min</span>
          </div>
          <button className="tutorial-button">Start Tutorial</button>
        </div>
      </div>
    </div>
  );
};

export default Tutorials;