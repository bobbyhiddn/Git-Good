// src/App.js
import React from 'react';
import CommandSection from './components/CommandSection';

function App() {
  return (
    <div className="app-container">
      <h1>Git Good: A Comprehensive Guide</h1>
      <p>
        Git is a distributed version control system widely used for tracking changes in source code during software development. This guide introduces basic Git operations, configurations for SSL verification, and password caching, as well as branch management and other essential commands.
      </p>
      {/* Configuring Git Settings */}
      <CommandSection
        title="Set SSL Verify to False"
        command="git config --global http.sslVerify false"
        description="To disable SSL certificate verification for HTTP connections."
        initialCommand="git config --global http.sslVerify false"
      />
      {/* Add more CommandSection components for other commands */}
      {/* For example: Initialize a New Git Repository */}
      <CommandSection
        title="Initialize a New Git Repository"
        command="git init"
        description="Initializes a new Git repository."
        initialCommand="git init"
      />
      {/* Continue adding CommandSections for all commands you want to include */}
    </div>
  );
}

export default App;
