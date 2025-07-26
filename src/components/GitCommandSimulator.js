// src/components/GitCommandSimulator.js
import React, { useState, useEffect, useRef, useContext } from 'react';
import { GitContext } from '../context/GitContext'; // Import the GitContext
import SyntaxHighlighter from './SyntaxHighlighter';

const GitCommandSimulator = ({ initialCommand }) => {
  const { gitState, setGitState } = useContext(GitContext);
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
  const currentStateRef = useRef(gitState);

  useEffect(() => {
    currentStateRef.current = gitState;
  }, [gitState]);

  // Available Unix commands
  const availableUnixCommands = ['ls', 'll', 'touch', 'mkdir', 'pwd', 'whoami', 'clear', 'echo'];

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

  // Simulate basic Unix commands
  const simulateCommand = (command, currentState) => {
    // Convert the entire command to lowercase for case-insensitive processing
    const commandLower = command.toLowerCase();

    const args = commandLower.trim().split(' ');
    const mainCommand = args[0];
    let workingState = JSON.parse(JSON.stringify(currentState)); // Deep copy

    if (!gitCommands.some(c => c.startsWith(mainCommand))) { 
        const cmd = args[0];
        switch (cmd) {
            case 'ls':
                const baseFiles = ['README.md', 'src', 'package.json'];
                const committedFiles = workingState.commits.flatMap(commit => commit.files);
                const allFiles = [...new Set([...baseFiles, ...committedFiles, ...(workingState.untrackedFiles || [])])];
                
                if (workingState.initialized) {
                    allFiles.unshift('.git');
                }
                return { newState: workingState, output: allFiles.sort().join('\n') };
            case 'touch':
                const filename = args[1];
                if (!filename) {
                    return { newState: workingState, output: 'touch: missing file operand' };
                }
                const currentUntrackedFiles = workingState.untrackedFiles || [];
                if (!currentUntrackedFiles.includes(filename)) {
                    workingState.untrackedFiles = [...currentUntrackedFiles, filename];
                }
                return { newState: workingState, output: `Created file: ${filename}` };
            case 'clear':
                return { newState: workingState, output: '', clear: true };
            default:
                return { newState: workingState, output: `bash: command not found: ${command}` };
        }
    }

    const subCommand = args[1];

    switch (subCommand) {
      case 'init':
        if (workingState.initialized) return { newState: workingState, output: 'Already up to date.' };
        workingState.initialized = true;
        return { newState: workingState, output: 'Initialized empty Git repository in /project/.git/' };

      case 'config':
        if (args[2] === '--global' && args[3] === 'http.sslverify' && args[4] === 'false') {
          return { newState: workingState, output: 'SSL verification disabled for HTTP connections.' };
        }
        if (args[2] === '--global' && args[3] === 'credential.helper') {
          return { newState: workingState, output: `Password caching set to ${args.slice(4).join(' ')}.` };
        }
        return { newState: workingState, output: 'Config command not recognized.' };

      case 'clone':
        return { newState: workingState, output: `Cloning into '${args[2]}'...` };

      case 'add':
        if (!workingState.initialized) return { newState: workingState, output: 'Error: Repository not initialized. Run "git init" first.' };
        const file = args[2];
        if (!file) return { newState: workingState, output: 'Error: Missing file argument' };

        const baseFiles = ['README.md', 'src', 'package.json'];
        const allFiles = [...baseFiles, ...(workingState.untrackedFiles || [])];

        if (!allFiles.includes(file)) {
          return { newState: workingState, output: `fatal: pathspec '${file}' did not match any files` };
        }

        if (!workingState.stagedChanges.includes(file)) {
          workingState.stagedChanges.push(file);
          if (workingState.untrackedFiles && workingState.untrackedFiles.includes(file)) {
            workingState.untrackedFiles = workingState.untrackedFiles.filter(f => f !== file);
          }
        }
        return { newState: workingState, output: `Changes staged for commit: ${file}` };

      case 'commit':
        if (!workingState.initialized) return { newState: workingState, output: 'Error: Repository not initialized. Run "git init" first.' };
        if (workingState.stagedChanges.length === 0) return { newState: workingState, output: 'Nothing to commit, working tree clean' };

        const messageIndex = args.findIndex((arg) => arg === '-m');
        if (messageIndex === -1 || !args[messageIndex + 1]) {
          return { newState: workingState, output: 'Error: Missing commit message. Use git commit -m "Your message"' };
        }

        const commitMessage = args.slice(messageIndex + 1).join(' ').replace(/"/g, '');
        const newCommit = {
          id: `c${workingState.commits.length + 1}`,
          message: commitMessage,
          files: [...workingState.stagedChanges],
        };
        workingState.commits.push(newCommit);
        workingState.stagedChanges = [];
        return { newState: workingState, output: `[${workingState.currentBranch} ${newCommit.id}] ${commitMessage}` };

      case 'push':
        return { newState: workingState, output: `Pushing to ${args[2]} ${args[3]}...` };

      case 'pull':
        return { newState: workingState, output: `Pulling from ${args[2]} ${args[3]}...` };

      case 'status':
        const statusOutput = `On branch ${workingState.currentBranch}\n` +
        `Untracked files: ${workingState.untrackedFiles.join(', ') || 'None'}\n` +
        `Staged changes: ${workingState.stagedChanges.join(', ') || 'None'}\n` +
        `Commits: ${workingState.commits.length}`;
      return { newState: workingState, output: statusOutput };

      case 'log':
        const logOutput = workingState.commits.map(c => `commit ${c.id}\nAuthor: User\nDate:   ${new Date().toDateString()}\n\n\t${c.message}`).join('\n\n');
        return { newState: workingState, output: logOutput };

      case 'branch':
        if (args.length === 2) {
          return { newState: workingState, output: workingState.branches
            .sort() // Sort branches alphabetically
            .map(branch => branch === workingState.currentBranch ? `* ${branch}` : `  ${branch}`)
            .join('\n') };
        }
        if (args.length === 3) {
          const branchName = args[2];
          if (workingState.branches.includes(branchName)) {
            return { newState: workingState, output: `Branch '${branchName}' already exists.` };
          }
          workingState.branches.push(branchName);
          return { newState: workingState, output: `Created branch ${branchName}` };
        }
        if (args[2] === '-d' || args[2] === '-D') {
          const branchToDelete = args[3];
          
          if (!branchToDelete) {
            return { newState: workingState, output: 'Error: Missing branch name. Usage: git branch -d <branch-name>' };
          }
          
          if (workingState.currentBranch === branchToDelete) {
            return { newState: workingState, output: `Error: Cannot delete branch '${branchToDelete}' checked out at '/current/directory'` };
          }
          
          if (!workingState.branches.includes(branchToDelete)) {
            return { newState: workingState, output: `Error: branch '${branchToDelete}' not found.` };
          }
          
          if (branchToDelete === 'main' || branchToDelete === 'master') {
            if (args[2] === '-d') {
              return { newState: workingState, output: `Error: The branch '${branchToDelete}' is not fully merged. If you are sure you want to delete it, run 'git branch -D ${branchToDelete}'.` };
            }
          }
          
          workingState.branches = workingState.branches.filter((b) => b !== branchToDelete);
          return { newState: workingState, output: `Deleted branch ${branchToDelete} (was ${Math.random().toString(36).substr(2, 7)}).` };
        }
        return { newState: workingState, output: 'Branch command not recognized.' };

      case 'checkout':
        if (args[2] === '-b') {
          const newBranchName = args[3];
          if (workingState.branches.includes(newBranchName)) {
            return { newState: workingState, output: `fatal: A branch named '${newBranchName}' already exists.` };
          }
          workingState.branches.push(newBranchName);
          workingState.currentBranch = newBranchName;
          return { newState: workingState, output: `Switched to a new branch '${newBranchName}'` };
        }
        const targetBranch = args[2];
        if (!targetBranch) return { newState: workingState, output: 'Error: Missing branch name' };
        if (!workingState.branches.includes(targetBranch)) {
          return { newState: workingState, output: `error: pathspec '${targetBranch}' did not match any file(s) known to git` };
        }
        workingState.currentBranch = targetBranch;
        return { newState: workingState, output: `Switched to branch '${targetBranch}'` };

      case 'merge':
        const branchToMerge = args[2];
        if (!branchToMerge) return { newState: workingState, output: 'Error: Missing branch to merge' };
        if (branchToMerge === workingState.currentBranch) return { newState: workingState, output: 'Already up to date.' };
        if (!workingState.branches.includes(branchToMerge)) return { newState: workingState, output: `fatal: '${branchToMerge}' does not point to a commit` };
        return { newState: workingState, output: `Merged ${branchToMerge} into ${workingState.currentBranch}` };

      case 'remote':
        if (args[2] === 'add') {
          const remoteName = args[3];
          const remoteUrl = args[4];
          if (!remoteName || !remoteUrl) return { newState: workingState, output: 'Usage: git remote add <name> <url>' };
          workingState.remotes = { ...workingState.remotes, [remoteName]: remoteUrl };
          return { newState: workingState, output: `Remote '${remoteName}' added.` };
        }
        const remoteList = `Remotes: ${Object.keys(workingState.remotes).join(', ')}`;
        return { newState: workingState, output: remoteList };

      case 'stash':
        if (args[2] === 'apply') {
          return { newState: workingState, output: 'Applied stashed changes.' };
        }
        workingState.stash = [...workingState.stash, 'Stashed changes'];
        return { newState: workingState, output: 'Changes stashed.' };

      case 'rebase':
        return { newState: workingState, output: `Rebasing ${workingState.currentBranch} onto ${args[2]}...` };

      case 'diff':
        return { newState: workingState, output: 'Showing differences...' };

      case 'help':
        return { newState: workingState, output: `Available commands:
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
git help` };

      default:
        return { newState: workingState, output: `Error: Command not recognized: ${command}` };
    }
  };

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    if (!currentCommand.trim()) return;

    const { newState, output, clear } = simulateCommand(currentCommand, currentStateRef.current);

    if (clear) {
      setCommandHistory([]);
      setCurrentCommand('');
      return;
    }

    setGitState(newState);
    currentStateRef.current = newState;

    const newHistoryEntry = {
      type: 'command',
      command: currentCommand,
      output: output,
    };

    setCommandHistory(prev => [...prev, newHistoryEntry]);
    setExecutedCommands(prev => [...prev, currentCommand]);
    setCurrentCommand('');
    setHistoryIndex(-1);
    setShowSuggestions(false);
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
