import React from 'react';
import GitCommandSimulator from '../components/GitCommandSimulator';
import FileSystemVisualizer from '../components/FileSystemVisualizer';
import { GitProvider } from '../context/GitContext';

const Terminal = () => {
  return (
    <GitProvider>
      <div className="terminal-page">
        <div className="terminal-header">
          <h1>Git Terminal Simulator</h1>
          <p>Practice Git commands in a safe, simulated environment.</p>
        </div>
        <div className="terminal-layout">
          <div className="terminal-container">
            <GitCommandSimulator initialCommand="" />
          </div>
          <div className="file-system-container">
            <FileSystemVisualizer />
          </div>
        </div>
      </div>
    </GitProvider>
  );
};

export default Terminal;