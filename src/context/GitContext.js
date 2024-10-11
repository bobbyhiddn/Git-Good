// src/context/GitContext.js
import React, { createContext, useState } from 'react';

export const GitContext = createContext();

export const GitProvider = ({ children }) => {
  const [gitState, setGitState] = useState({
    initialized: false,
    currentBranch: 'main',
    branches: ['main'],
    commits: [],
    stagedChanges: [],
    remotes: {},
    stash: [],
  });

  return (
    <GitContext.Provider value={{ gitState, setGitState }}>
      {children}
    </GitContext.Provider>
  );
};
