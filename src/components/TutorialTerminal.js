import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import { GitContext } from '../context/GitContext';
import SyntaxHighlighter from './SyntaxHighlighter';
import FileSystemVisualizer from './FileSystemVisualizer';

const TutorialTerminal = ({ tutorial }) => {
  const { gitState, setGitState } = useContext(GitContext);
  const [currentStep, setCurrentStep] = useState(0);
  const [commandHistory, setCommandHistory] = useState([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [isWaitingForCommand, setIsWaitingForCommand] = useState(true);
  const [stepCompleted, setStepCompleted] = useState(false);
  const inputRef = useRef(null);
  const terminalRef = useRef(null);
  const currentStateRef = useRef(gitState);

  // Initialize git state with tutorial's initial state
  useEffect(() => {
    const initialState = { ...tutorial.initialState, untrackedFiles: [] };
    setGitState(initialState);
    currentStateRef.current = initialState;
  }, [tutorial.initialState, setGitState]);
  
  // Keep currentStateRef in sync with gitState
  useEffect(() => {
    currentStateRef.current = gitState;
  }, [gitState]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Add initial instruction to history
    if (tutorial.steps[0]) {
      setCommandHistory([{
        type: 'instruction',
        content: tutorial.steps[0].instruction,
        explanation: tutorial.steps[0].explanation
      }]);
    }
  }, [tutorial]);

  useEffect(() => {
    // Focus input when waiting for command
    if (isWaitingForCommand && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isWaitingForCommand]);

  useEffect(() => {
    // Auto-scroll to bottom when command history updates
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commandHistory]);

  // Simulate Git/Unix commands with tutorial state
  const simulateCommand = (command, currentState) => {
    const args = command.toLowerCase().trim().split(' ');
    const mainCommand = args[0];
    let workingState = JSON.parse(JSON.stringify(currentState)); // Deep copy

    // Handle Unix commands
    if (mainCommand !== 'git') {
      return simulateUnixCommand(command, args, workingState);
    }

    // Handle Git commands with tutorial state
    const subCommand = args[1];

    switch (subCommand) {
      case 'init':
        if (workingState.initialized) return { newState: workingState, output: 'Git repository already initialized.' };
        workingState.initialized = true;
        return { newState: workingState, output: 'Initialized empty Git repository in /project/.git/' };

      case 'status':
        const statusOutput = `On branch ${workingState.currentBranch}\n` +
          `Untracked files: ${workingState.untrackedFiles.join(', ') || 'None'}\n` +
          `Staged changes: ${workingState.stagedChanges.join(', ') || 'None'}\n` +
          `Commits: ${workingState.commits.length}`;
        return { newState: workingState, output: statusOutput };

      case 'add':
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
        const messageIndex = args.findIndex((arg) => arg === '-m');
        if (messageIndex === -1 || !args[messageIndex + 1]) {
          return { newState: workingState, output: 'Error: Missing commit message. Use git commit -m "Your message"' };
        }
        if (workingState.stagedChanges.length === 0) return { newState: workingState, output: 'Nothing to commit, working tree clean' };

        const commitMessage = args.slice(messageIndex + 1).join(' ').replace(/"/g, '');
        const newCommit = {
          id: `c${workingState.commits.length + 1}`,
          message: commitMessage,
          files: [...workingState.stagedChanges],
        };
        workingState.commits.push(newCommit);
        workingState.stagedChanges = [];
        return { newState: workingState, output: `[${workingState.currentBranch} ${newCommit.id}] ${commitMessage}` };

      case 'branch':
        const branchName = args[2];
        if (!branchName) {
          const branchList = workingState.branches.map(b => `${b === workingState.currentBranch ? '*' : ' '} ${b}`).join('\n');
          return { newState: workingState, output: branchList };
        }
        if (workingState.branches.includes(branchName)) {
          return { newState: workingState, output: `fatal: A branch named '${branchName}' already exists.` };
        }
        workingState.branches.push(branchName);
        return { newState: workingState, output: `Branch '${branchName}' created.` };

      case 'checkout':
        const targetBranch = args[2];
        if (!targetBranch) return { newState: workingState, output: 'Error: Missing branch name' };
        if (!workingState.branches.includes(targetBranch)) {
          return { newState: workingState, output: `error: pathspec '${targetBranch}' did not match any file(s) known to git` };
        }
        workingState.currentBranch = targetBranch;
        return { newState: workingState, output: `Switched to branch '${targetBranch}'` };

      case 'log':
        const logOutput = workingState.commits.map(c => `commit ${c.id}\nAuthor: User\nDate:   ${new Date().toDateString()}\n\n\t${c.message}`).join('\n\n');
        return { newState: workingState, output: logOutput };

      case 'merge':
        const branchToMerge = args[2];
        if (!branchToMerge) return { newState: workingState, output: 'Error: Missing branch to merge' };
        if (branchToMerge === workingState.currentBranch) return { newState: workingState, output: 'Already up to date.' };
        if (!workingState.branches.includes(branchToMerge)) return { newState: workingState, output: `fatal: '${branchToMerge}' does not point to a commit` };
        return { newState: workingState, output: `Merged ${branchToMerge} into ${workingState.currentBranch}` };

      case 'rebase':
        const baseBranch = args[2];
        if (!baseBranch) return { newState: workingState, output: 'Error: Missing base branch' };
        return { newState: workingState, output: `Successfully rebased and updated ${workingState.currentBranch}.` };

      case 'reset':
        const target = args[2] || 'HEAD';
        if (target === 'HEAD' && workingState.stagedChanges.length > 0) {
          workingState.untrackedFiles = [...(workingState.untrackedFiles || []), ...workingState.stagedChanges];
          workingState.stagedChanges = [];
          return { newState: workingState, output: 'Unstaged all changes.' };
        }
        return { newState: workingState, output: 'Reset logic not fully implemented yet.' };

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

      case 'push':
        const remote = args[2];
        const branch = args[3];
        if (!remote || !branch) return { newState: workingState, output: 'Usage: git push <remote> <branch>' };
        if (!workingState.remotes[remote]) return { newState: workingState, output: `fatal: '${remote}' does not appear to be a git repository` };
        return { newState: workingState, output: `Everything up-to-date` };

      case 'pull':
        return { newState: workingState, output: 'Already up to date.' };

      case 'stash':
        if (workingState.stagedChanges.length === 0) return { newState: workingState, output: 'No local changes to save' };
        const stashId = `stash@{${workingState.stash.length}}`;
        workingState.stash.push({ id: stashId, changes: workingState.stagedChanges });
        workingState.stagedChanges = [];
        return { newState: workingState, output: `Saved working directory and index state WIP on ${workingState.currentBranch}: ${stashId}` };

      default:
        return { newState: workingState, output: `git: '${mainCommand} ${subCommand}' is not a git command. See 'git --help'.` };
    }
  };

  // Unix command simulation
  const simulateUnixCommand = (command, args, workingState) => {
    const cmd = args[0];
    
    switch (cmd) {
      case 'ls':
      case 'll':
        const baseFiles = ['README.md', 'src', 'package.json'];
        const allFiles = [...baseFiles, ...(workingState.untrackedFiles || [])];
        if (workingState.initialized) {
          allFiles.unshift('.git');
        }
        return { newState: workingState, output: allFiles.join('\n') };
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
      case 'echo':
        return { newState: workingState, output: args.slice(1).join(' ') };
      case 'mkdir':
        return { newState: workingState, output: `mkdir: command not implemented` };
      case 'clear':
        // Clear is a special case that modifies UI state directly, not git state.
        // It will be handled in handleCommandSubmit.
        return { newState: workingState, output: '' };
      default:
        return { newState: workingState, output: `bash: command not found: ${command}` };
    }
  };

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    if (!currentCommand.trim()) return;

    if (currentCommand.trim().toLowerCase() === 'clear') {
        setCommandHistory([]);
        setCurrentCommand('');
        return;
    }

    const { newState, output } = simulateCommand(currentCommand, currentStateRef.current);
    
    setGitState(newState);
    currentStateRef.current = newState; // Manually update the ref to ensure the next command has the latest state.

    const newHistoryEntry = {
      type: 'command',
      command: currentCommand,
      output: output,
    };

    setCommandHistory(prev => [...prev, newHistoryEntry]);

    // Check for completion
    const step = tutorial.steps[currentStep];
    if (currentCommand.trim().toLowerCase() === step.command.toLowerCase()) {
      setStepCompleted(true);
      setIsWaitingForCommand(false);
      // Add success message
      setCommandHistory(prev => [...prev, { type: 'success', content: `✅ Correct! ${step.explanation}` }]);
    } else {
      // Add hint message
      setCommandHistory(prev => [...prev, { type: 'hint', content: `🤔 Not quite. Try this: ${step.command}` }]);
    }

    setCurrentCommand('');
  };

  const handleNextStep = () => {
    if (currentStep < tutorial.steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setStepCompleted(false);
      setIsWaitingForCommand(true);
      setCommandHistory(prev => [...prev, {
        type: 'instruction',
        content: tutorial.steps[nextStep].instruction,
        explanation: tutorial.steps[nextStep].explanation
      }]);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setStepCompleted(false);
      setIsWaitingForCommand(true);
      const stepStartIndex = commandHistory.findLastIndex((entry, index) => {
        return entry.type === 'instruction' && index < commandHistory.length - 1;
      });
      if (stepStartIndex >= 0) {
        setCommandHistory(commandHistory.slice(0, stepStartIndex + 1));
      }
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setStepCompleted(false);
    setIsWaitingForCommand(true);
    const resetState = { ...tutorial.initialState, untrackedFiles: [] };
    setGitState(resetState);
    setCommandHistory([{
      type: 'instruction',
      content: tutorial.steps[0].instruction,
      explanation: tutorial.steps[0].explanation
    }]);
  };

  const progress = ((currentStep + (stepCompleted ? 1 : 0)) / tutorial.steps.length) * 100;

  return (
      <div className="tutorial-terminal-page">
        <div className="tutorial-header">
          <div className="tutorial-navigation">
            <Link to="/tutorials" className="back-to-tutorials">
              ← Back to Tutorials
            </Link>
            <div className="tutorial-controls">
              <button 
                onClick={handlePreviousStep} 
                disabled={currentStep === 0}
                className="tutorial-button"
              >
                ← Previous
              </button>
              <button 
                onClick={handleReset}
                className="tutorial-button reset"
              >
                🔄 Reset
              </button>
              <button 
                onClick={handleNextStep} 
                disabled={currentStep >= tutorial.steps.length - 1 || !stepCompleted}
                className="tutorial-button"
              >
                Next →
              </button>
            </div>
          </div>
          
          <div className="tutorial-info">
            <h1>{tutorial.title}</h1>
            <p>{tutorial.description}</p>
            <div className="tutorial-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="progress-text">
                Step {currentStep + 1} of {tutorial.steps.length}
              </span>
            </div>
          </div>
        </div>

        <div className="tutorial-layout">
          <div className="tutorial-terminal-container">
            <div className="terminal" ref={terminalRef}>
              {commandHistory.map((entry, index) => (
                <div key={index} className={`terminal-entry ${entry.type}`}>
                  {entry.type === 'instruction' && (
                    <div className="instruction-block">
                      <div className="instruction-icon">📋</div>
                      <div className="instruction-content">
                        <div className="instruction-text">{entry.content}</div>
                      </div>
                    </div>
                  )}
                  
                  {entry.type === 'command' && (
                    <>
                      <div className="command-prompt">
                        $ <span className="user-command">
                          <SyntaxHighlighter command={entry.command} type="command" />
                        </span>
                      </div>
                      <div className="command-output" style={{ whiteSpace: 'pre-line' }}>
                        <SyntaxHighlighter command={entry.output} type="output" />
                      </div>
                    </>
                  )}
                  
                  {entry.type === 'success' && (
                    <div className="success-block">
                      <div className="success-content">{entry.content}</div>
                    </div>
                  )}
                  
                  {entry.type === 'hint' && (
                    <div className="hint-block">
                      <div className="hint-content">{entry.content}</div>
                    </div>
                  )}
                </div>
              ))}
              
              {isWaitingForCommand && (
                <form onSubmit={handleCommandSubmit} className="terminal-form">
                  <span className="command-prompt">$ </span>
                  <input
                    type="text"
                    value={currentCommand}
                    onChange={(e) => setCurrentCommand(e.target.value)}
                    className="terminal-input"
                    placeholder={`Type: ${tutorial.steps[currentStep]?.command || ''}`}
                    ref={inputRef}
                  />
                  <button type="submit" className="send-button">
                    Send
                  </button>
                </form>
              )}
              
              {currentStep >= tutorial.steps.length - 1 && stepCompleted && (
                <div className="tutorial-complete">
                  <h3>🎉 Tutorial Complete!</h3>
                  <p>Great job! You've mastered {tutorial.title}.</p>
                  <Link to="/tutorials" className="back-to-tutorials-button">
                    Back to Tutorials
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          <div className="tutorial-file-system">
            <FileSystemVisualizer untrackedFiles={gitState.untrackedFiles || []} />
          </div>
        </div>
      </div>
  );
};

export default TutorialTerminal;