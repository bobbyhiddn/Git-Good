import React, { useState, useEffect, useRef } from 'react';
import { GitProvider, useGitContext } from '../context/GitContext';
import { simulateCommand } from '../components/GitCommandSimulator';

const TestTerminal = () => {
  return (
    <GitProvider>
      <TestTerminalContent />
    </GitProvider>
  );
};

const TestTerminalContent = () => {
  const { gitState, setGitState } = useGitContext();
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTestIndex, setCurrentTestIndex] = useState(-1);
  const terminalRef = useRef(null);

  // Test cases in logical order
  const testCases = [
    {
      name: 'Initialize Repository',
      command: 'git init',
      expectedOutput: 'Initialized empty Git repository in /project/.git/',
      description: 'Initialize a new Git repository'
    },
    {
      name: 'Check Initial Status',
      command: 'git status',
      expectedContains: 'On branch main',
      description: 'Check repository status after initialization'
    },
    {
      name: 'List Files',
      command: 'ls',
      expectedContains: '.git',
      description: 'List files in the working directory'
    },
    {
      name: 'Create New File',
      command: 'touch test.txt',
      expectedOutput: 'Created file: test.txt',
      description: 'Create a new file using touch command'
    },
    {
      name: 'List Files After Creation',
      command: 'ls',
      expectedContains: 'test.txt',
      description: 'Verify file appears in directory listing'
    },
    {
      name: 'Check Status with Untracked File',
      command: 'git status',
      expectedContains: 'test.txt',
      description: 'Check status shows untracked file'
    },
    {
      name: 'Stage File',
      command: 'git add test.txt',
      expectedOutput: 'Changes staged for commit: test.txt',
      description: 'Add file to staging area'
    },
    {
      name: 'Check Status After Staging',
      command: 'git status',
      expectedContains: 'Staged changes: test.txt',
      description: 'Verify file is staged'
    },
    {
      name: 'Commit Changes',
      command: 'git commit -m "Add test file"',
      expectedContains: '[main c1] Add test file',
      description: 'Commit staged changes'
    },
    {
      name: 'Check Log',
      command: 'git log',
      expectedContains: 'Add test file',
      description: 'View commit history'
    },
    {
      name: 'Create New Branch',
      command: 'git branch feature',
      expectedOutput: 'Created branch \'feature\'',
      description: 'Create a new branch'
    },
    {
      name: 'List Branches',
      command: 'git branch',
      expectedContains: '* main',
      description: 'List all branches'
    },
    {
      name: 'Switch to New Branch',
      command: 'git checkout feature',
      expectedOutput: 'Switched to branch \'feature\'',
      description: 'Switch to the feature branch'
    },
    {
      name: 'Create File on Feature Branch',
      command: 'touch feature.txt',
      expectedOutput: 'Created file: feature.txt',
      description: 'Create a file on the feature branch'
    },
    {
      name: 'Stage and Commit on Feature Branch',
      command: 'git add feature.txt',
      expectedOutput: 'Changes staged for commit: feature.txt',
      description: 'Stage file on feature branch'
    },
    {
      name: 'Commit on Feature Branch',
      command: 'git commit -m "Add feature file"',
      expectedContains: '[feature c2] Add feature file',
      description: 'Commit changes on feature branch'
    },
    {
      name: 'Switch Back to Main',
      command: 'git checkout main',
      expectedOutput: 'Switched to branch \'main\'',
      description: 'Switch back to main branch'
    },
    {
      name: 'Merge Feature Branch',
      command: 'git merge feature',
      expectedContains: 'Merged feature into main',
      description: 'Merge feature branch into main'
    },
    {
      name: 'List Files After Merge',
      command: 'ls',
      expectedContains: 'feature.txt',
      description: 'Verify merged files appear in working directory'
    },
    {
      name: 'Check Final Status',
      command: 'git status',
      expectedContains: 'On branch main',
      description: 'Check final repository status'
    }
  ];

  const runTest = async (testCase, index) => {
    setCurrentTestIndex(index);
    
    try {
      // Import the simulateCommand function from GitCommandSimulator
      const result = simulateCommand(testCase.command, gitState);
      
      if (result.clear) {
        // Handle clear command
        return {
          ...testCase,
          passed: true,
          actualOutput: 'Terminal cleared',
          error: null
        };
      }

      // Update git state if command modified it
      if (result.newState) {
        setGitState(result.newState);
      }

      // Check if test passed
      let passed = false;
      if (testCase.expectedOutput) {
        passed = result.output === testCase.expectedOutput;
      } else if (testCase.expectedContains) {
        passed = result.output.includes(testCase.expectedContains);
      }

      return {
        ...testCase,
        passed,
        actualOutput: result.output,
        error: null
      };
    } catch (error) {
      return {
        ...testCase,
        passed: false,
        actualOutput: '',
        error: error.message
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setCurrentTestIndex(-1);

    // Reset git state
    setGitState({
      initialized: false,
      branches: ['main'],
      currentBranch: 'main',
      commits: [],
      stagedChanges: [],
      untrackedFiles: [],
      remotes: {},
      stash: []
    });

    const results = [];
    
    for (let i = 0; i < testCases.length; i++) {
      const result = await runTest(testCases[i], i);
      results.push(result);
      setTestResults([...results]);
      
      // Small delay to make the process visible
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setCurrentTestIndex(-1);
    setIsRunning(false);
  };

  const resetTests = () => {
    setTestResults([]);
    setCurrentTestIndex(-1);
    setGitState({
      initialized: false,
      branches: ['main'],
      currentBranch: 'main',
      commits: [],
      stagedChanges: [],
      untrackedFiles: [],
      remotes: {},
      stash: []
    });
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [testResults]);

  const passedTests = testResults.filter(test => test.passed).length;
  const totalTests = testResults.length;

  return (
    <div className="test-terminal-page">
      <div className="test-header">
        <h1>Git Command Test Suite</h1>
        <p>Automated testing of all Git commands in logical order</p>
        
        <div className="test-controls">
          <button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="run-tests-btn"
          >
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </button>
          <button 
            onClick={resetTests} 
            disabled={isRunning}
            className="reset-tests-btn"
          >
            Reset
          </button>
        </div>

        {testResults.length > 0 && (
          <div className="test-summary">
            <span className={`test-score ${passedTests === totalTests ? 'all-passed' : 'some-failed'}`}>
              {passedTests}/{totalTests} tests passed
            </span>
          </div>
        )}
      </div>

      <div className="test-terminal" ref={terminalRef}>
        {testResults.map((test, index) => (
          <div 
            key={index} 
            className={`test-case ${test.passed ? 'passed' : 'failed'} ${currentTestIndex === index ? 'running' : ''}`}
          >
            <div className="test-info">
              <div className="test-name">
                <span className="test-number">{index + 1}.</span>
                <span className="test-title">{test.name}</span>
                <span className={`test-status ${test.passed ? 'pass' : 'fail'}`}>
                  {currentTestIndex === index ? '⏳' : test.passed ? '✅' : '❌'}
                </span>
              </div>
              <div className="test-description">{test.description}</div>
            </div>
            
            <div className="test-command">
              <span className="prompt">$ </span>
              <span className="command">{test.command}</span>
            </div>
            
            <div className="test-output">
              {test.actualOutput && (
                <div className="actual-output">
                  <strong>Output:</strong>
                  <pre>{test.actualOutput}</pre>
                </div>
              )}
              
              {test.error && (
                <div className="error-output">
                  <strong>Error:</strong>
                  <pre>{test.error}</pre>
                </div>
              )}
              
              {!test.passed && (
                <div className="expected-output">
                  <strong>Expected:</strong>
                  <pre>{test.expectedOutput || `Contains: "${test.expectedContains}"`}</pre>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {currentTestIndex >= 0 && (
          <div className="current-test-indicator">
            Running test {currentTestIndex + 1} of {testCases.length}...
          </div>
        )}
      </div>
    </div>
  );
};

export default TestTerminal;
