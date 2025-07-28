import React, { useState, useEffect, useRef, useContext } from 'react';
import { GitContext } from '../context/GitContext';
import SyntaxHighlighter from './SyntaxHighlighter';

const GitCommandSimulator = ({ initialCommand }) => {
  const [commandHistory, setCommandHistory] = useState([
    {
      command: '',
      output: 'Type your command and press Enter or click Send to execute.',
    },
  ]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [executedCommands, setExecutedCommands] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const inputRef = useRef(null);

  // Git command autocomplete data
  const gitCommands = [
    'git init',
    'git add',
    'git commit',
    'git commit -m',
    'git push',
    'git push origin',
    'git pull',
    'git pull origin',
    'git status',
    'git log',
    'git branch',
    'git branch -d',
    'git branch -D',
    'git checkout',
    'git checkout -b',
    'git checkout --',
    'git merge',
    'git remote',
    'git remote set-url',
    'git stash',
    'git stash apply',
    'git rebase',
    'git diff',
    'git config',
    'git config --global',
    'git clone',
    'git help'
  ];

  // Available Unix commands
  const availableUnixCommands = ['ls', 'll', 'touch', 'mkdir', 'pwd', 'whoami', 'clear', 'echo'];

  // Consume the shared gitState and setGitState from context
  const { gitState, setGitState } = useContext(GitContext);

  // Simulate basic Unix commands
  const simulateUnixCommand = (command, args) => {
    const cmd = args[0];
    
    switch (cmd) {
      case 'ls':
        if (args[1] === '-la' || args[1] === '-al') {
          return `total 8
drwxr-xr-x  5 user staff  160 ${new Date().toLocaleDateString()} .
drwxr-xr-x  3 user staff   96 ${new Date().toLocaleDateString()} ..
${gitState.initialized ? 'drwxr-xr-x  8 user staff  256 ' + new Date().toLocaleDateString() + ' .git' : ''}
-rw-r--r--  1 user staff   42 ${new Date().toLocaleDateString()} README.md
drwxr-xr-x  3 user staff   96 ${new Date().toLocaleDateString()} src
-rw-r--r--  1 user staff  123 ${new Date().toLocaleDateString()} package.json`;
        }
        return `${gitState.initialized ? '.git' : ''}\nREADME.md\nsrc\npackage.json`;

      case 'll':
        return `total 8
drwxr-xr-x  5 user staff  160 ${new Date().toLocaleDateString()} .
drwxr-xr-x  3 user staff   96 ${new Date().toLocaleDateString()} ..
${gitState.initialized ? 'drwxr-xr-x  8 user staff  256 ' + new Date().toLocaleDateString() + ' .git' : ''}
-rw-r--r--  1 user staff   42 ${new Date().toLocaleDateString()} README.md
drwxr-xr-x  3 user staff   96 ${new Date().toLocaleDateString()} src
-rw-r--r--  1 user staff  123 ${new Date().toLocaleDateString()} package.json`;

      case 'touch':
        if (!args[1]) {
          return 'touch: missing file operand';
        }
        return `Created file: ${args[1]}`;

      case 'mkdir':
        if (!args[1]) {
          return 'mkdir: missing operand';
        }
        return `Created directory: ${args[1]}`;

      case 'pwd':
        return '/project';

      case 'whoami':
        return 'developer';

      case 'clear':
        return 'Terminal cleared (simulated)';

      case 'echo':
        return args.slice(1).join(' ');

      default:
        return `Command '${cmd}' not found. Here are your available unix commands in this terminal emulator:

Available Unix commands:
• ls          - List directory contents
• ll          - List directory contents (detailed)
• ls -la      - List all files with details
• touch <file> - Create a new file
• mkdir <dir>  - Create a new directory
• pwd         - Show current directory path
• whoami      - Show current user
• clear       - Clear terminal (simulated)
• echo <text> - Print text to terminal

Available Git commands:
• git help    - Show all Git commands`;
    }
  };

  useEffect(() => {
    if (initialCommand) {
      setCurrentCommand(initialCommand);
    }
  }, [initialCommand]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    }
  }, []);

  const simulateGitCommand = (command) => {
    const commandLower = command.toLowerCase();
    const args = commandLower.trim().split(' ');
    const mainCommand = args[0];
    const subCommand = args[1];

    // Handle Unix commands
    if (mainCommand !== 'git') {
      return simulateUnixCommand(command, args);
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
          return gitState.branches
            .sort()
            .map(branch => branch === gitState.currentBranch ? `* ${branch}` : `  ${branch}`)
            .join('\n');
        }
        if (args.length === 3) {
          if (gitState.branches.includes(args[2])) {
            return `Branch '${args[2]}' already exists.`;
          }
          setGitState({ ...gitState, branches: [...gitState.branches, args[2]] });
          return `Created branch ${args[2]}`;
        }
        if (args[2] === '-d' || args[2] === '-D') {
          const branchToDelete = args[3];
          
          if (!branchToDelete) {
            return 'Error: Missing branch name. Usage: git branch -d <branch-name>';
          }
          
          if (gitState.currentBranch === branchToDelete) {
            return `Error: Cannot delete branch '${branchToDelete}' checked out at '/current/directory'`;
          }
          
          if (!gitState.branches.includes(branchToDelete)) {
            return `Error: branch '${branchToDelete}' not found.`;
          }
          
          if (branchToDelete === 'main' || branchToDelete === 'master') {
            if (args[2] === '-d') {
              return `Error: The branch '${branchToDelete}' is not fully merged. If you are sure you want to delete it, run 'git branch -D ${branchToDelete}'.`;
            }
          }
          
          setGitState({
            ...gitState,
            branches: gitState.branches.filter((b) => b !== branchToDelete),
          });
          return `Deleted branch ${branchToDelete} (was ${Math.random().toString(36).substr(2, 7)}).`;
        }
        return 'Branch command not recognized.';

      case 'checkout':
        if (args[2] === '-b') {
          if (gitState.branches.includes(args[3])) {
            return `fatal: A branch named '${args[3]}' already exists.`;
          }
          setGitState({
            ...gitState,
            branches: [...gitState.branches, args[3]],
            currentBranch: args[3],
          });
          return `Switched to a new branch '${args[3]}'`;
        }
        if (args[2] && gitState.branches.includes(args[2])) {
          setGitState({ ...gitState, currentBranch: args[2] });
          return `Switched to branch '${args[2]}'`;
        }
        if (args[2] === '--') {
          return `Reverted changes to ${args[3]} to last committed state.`;
        }
        if (args[2]) {
          return `error: pathspec '${args[2]}' did not match any file(s) known to git`;
        }
        return 'You must specify a branch name.';

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
    if (currentCommand.trim() === '') return;
    const output = simulateGitCommand(currentCommand);
    setCommandHistory([...commandHistory, { command: currentCommand, output }]);
    setExecutedCommands([...executedCommands, currentCommand]);
    setCurrentCommand('');
    setHistoryIndex(-1);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e) => {
    // Handle autocomplete suggestions
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        return;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        return;
      } else if (e.key === 'Tab') {
        e.preventDefault();
        setCurrentCommand(suggestions[selectedSuggestion]);
        setShowSuggestions(false);
        return;
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
        return;
      }
    }

    // Handle command history when no suggestions are shown
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setShowSuggestions(false);
      if (executedCommands.length > 0) {
        const newIndex = historyIndex + 1;
        if (newIndex < executedCommands.length) {
          setHistoryIndex(newIndex);
          setCurrentCommand(executedCommands[executedCommands.length - 1 - newIndex]);
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setShowSuggestions(false);
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(executedCommands[executedCommands.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentCommand('');
      }
    } else if (e.key === 'Tab' && currentCommand.trim().length > 0) {
      e.preventDefault();
      const newSuggestions = getSuggestions(currentCommand);
      if (newSuggestions.length > 0) {
        setCurrentCommand(newSuggestions[0]);
      }
    }
  };

  // Get autocomplete suggestions
  const getSuggestions = (input) => {
    if (!input.trim()) return [];
    
    // Unix command suggestions
    const unixSuggestions = availableUnixCommands.filter(cmd => 
      cmd.toLowerCase().startsWith(input.toLowerCase())
    );
    
    // Git command suggestions
    const filtered = gitCommands.filter(cmd => 
      cmd.toLowerCase().startsWith(input.toLowerCase())
    );
    
    // Also suggest branch names for checkout/merge commands
    if (input.includes('checkout ') || input.includes('merge ')) {
      const branchSuggestions = gitState.branches
        .filter(branch => branch !== gitState.currentBranch)
        .map(branch => {
          if (input.includes('checkout ')) {
            return `git checkout ${branch}`;
          }
          return `git merge ${branch}`;
        })
        .filter(cmd => cmd.toLowerCase().startsWith(input.toLowerCase()));
      
      filtered.push(...branchSuggestions);
    }
    
    // Combine all suggestions
    const allSuggestions = [...unixSuggestions, ...filtered];
    return allSuggestions.slice(0, 6); // Limit to 6 suggestions
  };

  // Handle input changes and show suggestions
  const handleInputChange = (e) => {
    const value = e.target.value;
    setCurrentCommand(value);
    setHistoryIndex(-1);
    
    const newSuggestions = getSuggestions(value);
    setSuggestions(newSuggestions);
    setShowSuggestions(newSuggestions.length > 0 && value.trim().length > 0);
    setSelectedSuggestion(0);
  };

  return (
    <div className="terminal">
      {commandHistory.map((entry, index) => (
        <div key={index}>
          {entry.command ? (
            <>
              <div className="command-prompt">
                $ <span className="user-command">
                  <SyntaxHighlighter command={entry.command} type="command" />
                </span>
              </div>
              <div
                className={`command-output ${
                  entry.output.startsWith('Error:') ? 'error' : ''
                }`}
                style={{ whiteSpace: 'pre-line' }}
              >
                <SyntaxHighlighter command={entry.output} type="output" />
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
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="terminal-input"
          placeholder="Type your command here..."
          ref={inputRef}
        />
        <button type="submit" className="send-button" aria-label="Send command">
          Send
        </button>
      </form>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="autocomplete-dropdown">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`autocomplete-item ${index === selectedSuggestion ? 'selected' : ''}`}
              onClick={() => {
                setCurrentCommand(suggestion);
                setShowSuggestions(false);
                inputRef.current?.focus();
              }}
            >
              <SyntaxHighlighter command={suggestion} type="command" />
            </div>
          ))}
          <div className="autocomplete-hint">
            Use ↑↓ to navigate, Tab to complete, Esc to close
          </div>
        </div>
      )}
    </div>
  );
};

export default GitCommandSimulator;