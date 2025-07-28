import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { tutorials } from '../data/tutorials';

const Tutorials = () => {
  const [testResults, setTestResults] = useState(null);
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [currentTestingTutorial, setCurrentTestingTutorial] = useState(null);

  // Simulate Git/Unix commands (same logic as TutorialTerminal)
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
      case 'clear':
        return { newState: workingState, output: '' };
      default:
        return { newState: workingState, output: `bash: command not found: ${command}` };
    }
  };

  const testAllTutorials = async () => {
    setIsTestingAll(true);
    setTestResults(null);
    
    const allResults = {
      totalTutorials: Object.keys(tutorials).length,
      passedTutorials: 0,
      failedTutorials: 0,
      tutorialResults: []
    };

    try {
      // Test each tutorial
      for (const [tutorialId, tutorial] of Object.entries(tutorials)) {
        setCurrentTestingTutorial(tutorial);
        
        // Reset to initial state for each tutorial
        let testState = { ...tutorial.initialState, untrackedFiles: [] };
        
        const tutorialResult = {
          id: tutorialId,
          title: tutorial.title,
          difficulty: tutorial.difficulty,
          passed: 0,
          failed: 0,
          steps: []
        };

        // Run through each step of this tutorial
        for (let i = 0; i < tutorial.steps.length; i++) {
          const step = tutorial.steps[i];
          const { newState, output } = simulateCommand(step.command, testState);
          
          // Check if the command executed successfully
          const success = !output.includes('Error') && !output.includes('fatal:') && !output.includes('bash:');
          
          tutorialResult.steps.push({
            stepNumber: i + 1,
            instruction: step.instruction,
            command: step.command,
            expectedOutput: step.explanation,
            actualOutput: output,
            passed: success
          });
          
          if (success) {
            tutorialResult.passed++;
          } else {
            tutorialResult.failed++;
          }
          
          testState = newState;
        }

        // Determine if tutorial passed overall (all steps must pass)
        const tutorialPassed = tutorialResult.failed === 0;
        tutorialResult.overallPassed = tutorialPassed;
        
        if (tutorialPassed) {
          allResults.passedTutorials++;
        } else {
          allResults.failedTutorials++;
        }
        
        allResults.tutorialResults.push(tutorialResult);
        
        // Small delay between tutorials for visual effect
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    } catch (error) {
      console.error('Error testing tutorials:', error);
    }
    
    setCurrentTestingTutorial(null);
    setTestResults(allResults);
    setIsTestingAll(false);
  };

  return (
    <div className="tutorials-page">
      <div className="tutorials-header">
        <h1>Git Tutorials</h1>
        <p>Learn Git through interactive challenges and scenarios.</p>
        
        <div className="tutorials-actions">
          <button 
            onClick={testAllTutorials}
            disabled={isTestingAll}
            className="test-all-tutorials-btn"
          >
            {isTestingAll ? '🧪 Testing All Tutorials...' : '🧪 Test All Tutorials'}
          </button>
        </div>

        {currentTestingTutorial && (
          <div className="current-test-indicator">
            Currently testing: {currentTestingTutorial.title}
          </div>
        )}
      </div>

      {/* Test Results Section */}
      {testResults && (
        <div className="all-tutorials-test-results">
          <h2>All Tutorials Test Results</h2>
          <div className="test-summary">
            <div className={`test-score ${testResults.failedTutorials === 0 ? 'all-passed' : 'some-failed'}`}>
              Tutorials: {testResults.totalTutorials} | 
              Passed: {testResults.passedTutorials} | 
              Failed: {testResults.failedTutorials}
            </div>
          </div>
          
          <div className="tutorial-results-grid">
            {testResults.tutorialResults.map((result, index) => (
              <div key={result.id} className={`tutorial-test-card ${result.overallPassed ? 'passed' : 'failed'}`}>
                <div className="tutorial-test-header">
                  <h3>{result.title}</h3>
                  <span className="tutorial-test-status">
                    {result.overallPassed ? '✅' : '❌'}
                  </span>
                </div>
                <div className="tutorial-test-meta">
                  <span className={`difficulty ${result.id.split('-')[0]}`}>
                    {result.difficulty.charAt(0).toUpperCase() + result.difficulty.slice(1)}
                  </span>
                  <span className="step-count">
                    {result.passed}/{result.passed + result.failed} steps passed
                  </span>
                </div>
                <div className="tutorial-test-summary">
                  {result.overallPassed ? 
                    'All steps completed successfully!' : 
                    `${result.failed} step(s) failed`
                  }
                </div>
                {!result.overallPassed && (
                  <details className="failed-steps">
                    <summary>View Failed Steps</summary>
                    {result.steps.filter(step => !step.passed).map((step, stepIndex) => (
                      <div key={stepIndex} className="failed-step">
                        <strong>Step {step.stepNumber}:</strong> {step.instruction}
                        <div className="failed-command">$ {step.command}</div>
                        <div className="failed-output">{step.actualOutput}</div>
                      </div>
                    ))}
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="tutorials-grid">
        {Object.values(tutorials).map((tutorial) => (
          <div key={tutorial.id} className="tutorial-card">
            <h3>{tutorial.title}</h3>
            <p>{tutorial.description}</p>
            <div className="tutorial-meta">
              <span className={`difficulty ${tutorial.difficulty}`}>
                {tutorial.difficulty.charAt(0).toUpperCase() + tutorial.difficulty.slice(1)}
              </span>
              <span className="duration">{tutorial.duration}</span>
            </div>
            <Link to={`/tutorials/${tutorial.id}`} className="tutorial-button">
              Start Tutorial
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tutorials;