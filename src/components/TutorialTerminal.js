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
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [isTestRunning, setIsTestRunning] = useState(false);
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
        
        // Define all possible files that can exist in tutorials
        const baseFiles = ['README.md', 'readme.md', 'src', 'package.json'];
        const tutorialFiles = [
          'src/app.js', 'src/login.js', 'src/auth.js', 'src/config.js', 
          'src/database.js', 'src/feature.js', 'tests/auth.test.js',
          'bugfix.js', '.gitignore'
        ];
        const allFiles = [...baseFiles, ...tutorialFiles, ...(workingState.untrackedFiles || [])];
        
        // Case-insensitive file matching for common files
        let matchedFile = file;
        if (!allFiles.includes(file)) {
          // Try case-insensitive matching
          const lowerFile = file.toLowerCase();
          const foundFile = allFiles.find(f => f.toLowerCase() === lowerFile);
          if (foundFile) {
            matchedFile = foundFile;
          } else {
            // Auto-create the file if it doesn't exist (simulate touch)
            matchedFile = file;
            if (!workingState.untrackedFiles) workingState.untrackedFiles = [];
            if (!workingState.untrackedFiles.includes(file)) {
              workingState.untrackedFiles.push(file);
            }
          }
        }
        
        if (!workingState.stagedChanges.includes(matchedFile)) {
          workingState.stagedChanges.push(matchedFile);
          if (workingState.untrackedFiles && workingState.untrackedFiles.includes(matchedFile)) {
            workingState.untrackedFiles = workingState.untrackedFiles.filter(f => f !== matchedFile);
          }
        }
        return { newState: workingState, output: `Changes staged for commit: ${matchedFile}` };

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
        const checkoutFlag = args[2];
        if (checkoutFlag === '-b') {
          // Create and switch to new branch
          const newBranchName = args[3];
          if (!newBranchName) return { newState: workingState, output: 'Error: Missing branch name' };
          if (workingState.branches.includes(newBranchName)) {
            return { newState: workingState, output: `fatal: A branch named '${newBranchName}' already exists.` };
          }
          workingState.branches.push(newBranchName);
          workingState.currentBranch = newBranchName;
          return { newState: workingState, output: `Switched to a new branch '${newBranchName}'` };
        } else {
          // Switch to existing branch
          const targetBranch = checkoutFlag;
          if (!targetBranch) return { newState: workingState, output: 'Error: Missing branch name' };
          if (!workingState.branches.includes(targetBranch)) {
            return { newState: workingState, output: `error: pathspec '${targetBranch}' did not match any file(s) known to git` };
          }
          workingState.currentBranch = targetBranch;
          return { newState: workingState, output: `Switched to branch '${targetBranch}'` };
        }

      case 'log':
        const logOutput = workingState.commits.map(c => `commit ${c.id}\nAuthor: User\nDate:   ${new Date().toDateString()}\n\n\t${c.message}`).join('\n\n');
        return { newState: workingState, output: logOutput };

      case 'merge':
        const branchToMerge = args[2];
        if (!branchToMerge) return { newState: workingState, output: 'Error: Missing branch to merge' };
        if (branchToMerge === workingState.currentBranch) return { newState: workingState, output: 'Already up to date.' };
        if (!workingState.branches.includes(branchToMerge)) {
          // Auto-create the branch if it doesn't exist (common in tutorials)
          workingState.branches.push(branchToMerge);
        }
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
        const tutorialFiles = [
          'src/app.js', 'src/login.js', 'src/auth.js', 'src/config.js', 
          'src/database.js', 'src/feature.js', 'tests/auth.test.js',
          'bugfix.js', '.gitignore'
        ];
        const visibleFiles = [...baseFiles];
        
        // Add tutorial files and untracked files
        const allUntrackedFiles = workingState.untrackedFiles || [];
        tutorialFiles.forEach(file => {
          if (allUntrackedFiles.includes(file) || workingState.stagedChanges.includes(file)) {
            visibleFiles.push(file);
          }
        });
        
        // Add any other untracked files
        allUntrackedFiles.forEach(file => {
          if (!visibleFiles.includes(file)) {
            visibleFiles.push(file);
          }
        });
        
        if (workingState.initialized) {
          visibleFiles.unshift('.git');
        }
        
        // Remove duplicates and sort
        const uniqueFiles = [...new Set(visibleFiles)].sort();
        return { newState: workingState, output: uniqueFiles.join('\n') };
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

  const runTutorialTest = async () => {
    setIsTestRunning(true);
    setTestResults(null);
    
    // Reset to initial state
    let testState = { ...tutorial.initialState, untrackedFiles: [] };
    
    const results = {
      passed: 0,
      failed: 0,
      steps: []
    };

    try {
      // Run through each step automatically
      for (let i = 0; i < tutorial.steps.length; i++) {
        const step = tutorial.steps[i];
        const { newState, output } = simulateCommand(step.command, testState);
        
        // Check if the command executed successfully
        const success = !output.includes('Error') && !output.includes('fatal:') && !output.includes('bash:');
        
        results.steps.push({
          stepNumber: i + 1,
          instruction: step.instruction,
          command: step.command,
          expectedOutput: step.explanation,
          actualOutput: output,
          passed: success
        });
        
        if (success) {
          results.passed++;
        } else {
          results.failed++;
        }
        
        testState = newState;
        
        // Small delay for visual effect
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } catch (error) {
      results.steps.push({
        stepNumber: tutorial.steps.length + 1,
        instruction: 'Test execution error',
        command: 'N/A',
        expectedOutput: 'No errors',
        actualOutput: error.message,
        passed: false
      });
      results.failed++;
    }
    
    setTestResults(results);
    setIsTestRunning(false);
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
              <button 
                onClick={runTutorialTest}
                disabled={isTestRunning}
                className="tutorial-button test"
              >
                {isTestRunning ? '🧪 Testing...' : '🧪 Test Tutorial'}
              </button>
              <button 
                onClick={() => setShowWorkflow(!showWorkflow)}
                className="tutorial-button workflow"
              >
                {showWorkflow ? '🔍 Hide Workflow' : '🔍 Reveal Workflow'}
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

        {/* Test Results Section */}
        {testResults && (
          <div className="tutorial-test-results">
            <h3>Tutorial Test Results</h3>
            <div className="test-summary">
              <span className={`test-score ${testResults.failed === 0 ? 'all-passed' : 'some-failed'}`}>
                Steps: {testResults.passed + testResults.failed} | 
                Passed: {testResults.passed} | 
                Failed: {testResults.failed}
              </span>
            </div>
            <div className="test-steps">
              {testResults.steps.map((step, index) => (
                <div key={index} className={`test-step ${step.passed ? 'passed' : 'failed'}`}>
                  <div className="step-header">
                    <span className="step-number">Step {step.stepNumber}</span>
                    <span className="step-status">{step.passed ? '✅' : '❌'}</span>
                  </div>
                  <div className="step-instruction">{step.instruction}</div>
                  <div className="step-command">
                    <span className="prompt">$ </span>
                    <span className="command">{step.command}</span>
                  </div>
                  <div className="step-output">
                    <strong>Output:</strong>
                    <pre>{step.actualOutput}</pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Workflow Reveal Section */}
        {showWorkflow && (
          <div className="tutorial-workflow">
            <h3>Complete Tutorial Workflow</h3>
            <p>Here's the complete sequence of commands for this tutorial:</p>
            <div className="workflow-commands">
              {tutorial.steps.map((step, index) => (
                <div key={index} className="workflow-step">
                  <div className="workflow-step-header">
                    <span className="workflow-step-number">Step {index + 1}</span>
                  </div>
                  <div className="workflow-instruction">{step.instruction}</div>
                  <div className="workflow-command">
                    <span className="prompt">$ </span>
                    <code>{step.command}</code>
                  </div>
                  <div className="workflow-explanation">{step.explanation}</div>
                </div>
              ))}
            </div>
            <div className="workflow-summary">
              <h4>What You'll Learn:</h4>
              <ul>
                {tutorial.steps.map((step, index) => (
                  <li key={index}>{step.explanation}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
  );
};

export default TutorialTerminal;