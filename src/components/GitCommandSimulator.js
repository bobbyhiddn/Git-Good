// src/components/GitCommandSimulator.js
import React, { useState, useEffect, useRef, useContext } from 'react';
import { GitContext } from '../context/GitContext'; // Import the GitContext

const GitCommandSimulator = ({ initialCommand }) => {
  const [commandHistory, setCommandHistory] = useState([
    {
      command: '',
      output: 'Type your command and press Enter or click Send to execute.',
    },
  ]);
  const [currentCommand, setCurrentCommand] = useState('');
  const inputRef = useRef(null);

  // Consume the shared gitState and setGitState from context
  const { gitState, setGitState } = useContext(GitContext);

  useEffect(() => {
    if (initialCommand) {
      setCurrentCommand(initialCommand);
    }
  }, [initialCommand]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const simulateGitCommand = (command) => {
    // Convert the entire command to lowercase for case-insensitive processing
    const commandLower = command.toLowerCase();

    const args = commandLower.trim().split(' ');
    const mainCommand = args[0]; // 'git'
    const subCommand = args[1];

    if (mainCommand !== 'git') {
      return `Error: Command not recognized: ${command}`;
    }

    switch (subCommand) {
      case 'init':
        if (gitState.initialized) return 'Git repository already initialized.';
        setGitState({ ...gitState, initialized: true });
        return 'Initialized empty Git repository in /path/to/repository/.git/';

      case 'config':
        if (args[2] === '--global' && args[3] === 'http.sslverify' && args[4] === 'false') {
          return 'SSL verification disabled for HTTP connections.';
        }
        if (args[2] === '--global' && args[3] === 'credential.helper') {
          return `Password caching set to ${args.slice(4).join(' ')}.`;
        }
        return 'Config command not recognized.';

      case 'clone':
        return `Cloning into '${args[2]}'...`;

      case 'add':
        if (!gitState.initialized) return 'Error: Repository not initialized. Run "git init" first.';
        setGitState({ ...gitState, stagedChanges: [...gitState.stagedChanges, args[2]] });
        return `Changes staged for commit: ${args[2]}`;

      case 'commit':
        if (!gitState.initialized) return 'Error: Repository not initialized. Run "git init" first.';
        if (gitState.stagedChanges.length === 0) return 'No changes staged for commit.';
        const messageIndex = args.findIndex((arg) => arg === '-m');
        if (messageIndex === -1 || !args[messageIndex + 1]) {
          return 'Error: Commit message required. Use git commit -m "Your message".';
        }
        const commitMessage = command.match(/-m\s+["']?(.+?)["']?$/)?.[1] || 'No message';
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
          if (gitState.branches.includes(args[2])) {
            return `Branch '${args[2]}' already exists.`;
          }
          setGitState({ ...gitState, branches: [...gitState.branches, args[2]] });
          return `Created branch ${args[2]}`;
        }
        if (args[2] === '-d' || args[2] === '-D') {
          if (gitState.currentBranch === args[3]) {
            return 'Error: Cannot delete the current branch.';
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
          if (gitState.branches.includes(args[3])) {
            return `Branch '${args[3]}' already exists.`;
          }
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
        if (args[2] === '--') {
          return `Reverted changes to ${args[3]} to last committed state.`;
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

      case 'help':
        return `Available commands:
git init
git config
git clone
git add
git commit
git push
git pull
git status
git log
git branch
git checkout
git merge
git remote
git stash
git rebase
git diff
git help`;

      default:
        return `Error: Command not recognized: ${command}`;
    }
  };

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    if (currentCommand.trim() === '') return; // Prevent empty commands
    const output = simulateGitCommand(currentCommand);
    setCommandHistory([...commandHistory, { command: currentCommand, output }]);
    setCurrentCommand('');
  };

  return (
    <div className="terminal">
      {commandHistory.map((entry, index) => (
        <div key={index}>
          {entry.command ? (
            <>
              <div className="command-prompt">
                $ <span className="user-command">{entry.command}</span>
              </div>
              <div
                className={`command-output ${
                  entry.output.startsWith('Error:') ? 'error' : ''
                }`}
              >
                {entry.output}
              </div>
            </>
          ) : (
            <div className="initial-instruction">{entry.output}</div>
          )}
        </div>
      ))}
      <form onSubmit={handleCommandSubmit} className="terminal-form">
        <span className="command-prompt">$ </span>
        <input
          type="text"
          value={currentCommand}
          onChange={(e) => setCurrentCommand(e.target.value)}
          className="terminal-input"
          placeholder="Type your command here..."
          ref={inputRef}
        />
        <button type="submit" className="send-button" aria-label="Send command">
          Send
        </button>
      </form>
    </div>
  );
};

export default GitCommandSimulator;
