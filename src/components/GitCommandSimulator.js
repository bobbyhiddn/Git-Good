// src/components/GitCommandSimulator.js
import React, { useState, useEffect } from 'react';

const GitCommandSimulator = ({ initialCommand }) => {
  const [commandHistory, setCommandHistory] = useState([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [gitState, setGitState] = useState({
    initialized: false,
    currentBranch: 'main',
    branches: ['main'],
    commits: [],
    stagedChanges: [],
    remotes: {},
    stash: [],
  });

  useEffect(() => {
    if (initialCommand) {
      const output = simulateGitCommand(initialCommand);
      setCommandHistory([{ command: initialCommand, output }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const simulateGitCommand = (command) => {
    const args = command.trim().split(' ');
    const mainCommand = args[0]; // 'git'
    const subCommand = args[1];

    if (mainCommand !== 'git') {
      return `Command not recognized: ${command}`;
    }

    switch (subCommand) {
      case 'init':
        if (gitState.initialized) return 'Git repository already initialized.';
        setGitState({ ...gitState, initialized: true });
        return 'Initialized empty Git repository in /path/to/repository/.git/';

      case 'config':
        if (args[2] === '--global' && args[3] === 'http.sslVerify' && args[4] === 'false') {
          return 'SSL verification disabled for HTTP connections.';
        }
        if (args[2] === '--global' && args[3] === 'credential.helper') {
          return `Password caching set to ${args[4]}.`;
        }
        return 'Config command not recognized.';

      case 'clone':
        return `Cloning into '${args[2]}'...`;

      case 'add':
        if (!gitState.initialized) return 'Repository not initialized. Use git init first.';
        setGitState({ ...gitState, stagedChanges: [...gitState.stagedChanges, args[2]] });
        return `Changes staged for commit: ${args[2]}`;

      case 'commit':
        if (!gitState.initialized) return 'Repository not initialized. Use git init first.';
        if (gitState.stagedChanges.length === 0) return 'No changes staged for commit.';
        const messageIndex = args.findIndex((arg) => arg === '-m');
        if (messageIndex === -1 || !args[messageIndex + 1]) {
          return 'Commit message required. Use git commit -m "Your message".';
        }
        const commitMessage = args.slice(messageIndex + 1).join(' ').replace(/"/g, '');
        const newCommit = {
          id: Math.random().toString(36).substr(2, 9),
          message: commitMessage,
        };
        setGitState({
          ...gitState,
          commits: [...gitState.commits, newCommit],
          stagedChanges: [],
        });
        return `[${gitState.currentBranch} ${newCommit.id}] ${newCommit.message}`;

      case 'push':
        return `Pushing to ${args[2]} ${args[3]}...`;

      case 'pull':
        return `Pulling from ${args[2]} ${args[3]}...`;

      case 'status':
        return `On branch ${gitState.currentBranch}\n` +
          `Staged changes: ${gitState.stagedChanges.join(', ') || 'None'}\n` +
          `Commits: ${gitState.commits.length}`;

      case 'log':
        return gitState.commits
          .map((commit) => `${commit.id} ${commit.message}`)
          .join('\n') || 'No commits yet.';

      case 'branch':
        if (args.length === 2) {
          return gitState.branches.join('\n');
        }
        if (args.length === 3) {
          setGitState({ ...gitState, branches: [...gitState.branches, args[2]] });
          return `Created branch ${args[2]}`;
        }
        if (args[2] === '-d' || args[2] === '-D') {
          if (gitState.currentBranch === args[3]) {
            return 'Cannot delete the current branch.';
          }
          setGitState({
            ...gitState,
            branches: gitState.branches.filter((b) => b !== args[3]),
          });
          return `Deleted branch ${args[3]}`;
        }
        return 'Branch command not recognized.';

      case 'checkout':
        if (args[2] === '-b') {
          setGitState({
            ...gitState,
            branches: [...gitState.branches, args[3]],
            currentBranch: args[3],
          });
          return `Switched to a new branch '${args[3]}'`;
        }
        if (gitState.branches.includes(args[2])) {
          setGitState({ ...gitState, currentBranch: args[2] });
          return `Switched to branch '${args[2]}'`;
        }
        return 'Branch not found.';

      case 'merge':
        return `Merging ${args[2]} into ${gitState.currentBranch}...`;

      case 'remote':
        if (args[2] === 'set-url') {
          setGitState({
            ...gitState,
            remotes: { ...gitState.remotes, [args[3]]: args[4] },
          });
          return `Remote ${args[3]} updated to ${args[4]}`;
        }
        return 'Remote command not recognized.';

      case 'stash':
        if (args[2] === 'apply') {
          return 'Applied stashed changes.';
        }
        setGitState({ ...gitState, stash: [...gitState.stash, 'Stashed changes'] });
        return 'Changes stashed.';

      case 'rebase':
        return `Rebasing ${gitState.currentBranch} onto ${args[2]}...`;

      case 'diff':
        return 'Showing differences...';

      default:
        return `Command not recognized: ${command}`;
    }
  };

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    const output = simulateGitCommand(currentCommand);
    setCommandHistory([...commandHistory, { command: currentCommand, output }]);
    setCurrentCommand('');
  };

  return (
    <div className="terminal">
      {commandHistory.map((entry, index) => (
        <div key={index}>
          <div className="text-yellow-400">$ {entry.command}</div>
          <div className="whitespace-pre-wrap">{entry.output}</div>
        </div>
      ))}
      <form onSubmit={handleCommandSubmit}>
        <span>$ </span>
        <input
          type="text"
          value={currentCommand}
          onChange={(e) => setCurrentCommand(e.target.value)}
          className="terminal-input"
          placeholder="Enter Git command..."
          autoFocus
        />
      </form>
    </div>
  );
};

export default GitCommandSimulator;
