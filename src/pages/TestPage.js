import React, { useState } from 'react';
import { GitProvider } from '../context/GitContext';
import { gitTestSuites } from '../data/gitTests';
import { simulateGitCommand } from '../utils/gitSimulator';

const TestPage = () => {
  const [testResults, setTestResults] = useState({});
  const [currentTest, setCurrentTest] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [allTests, setAllTests] = useState([]);

  // Flatten all tests from all suites
  const getAllTests = () => {
    const tests = [];
    Object.entries(gitTestSuites).forEach(([suiteKey, suite]) => {
      suite.tests.forEach((test, index) => {
        tests.push({
          ...test,
          suiteKey,
          suiteName: suite.name,
          testNumber: tests.length + 1
        });
      });
    });
    return tests;
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults({});
    const tests = getAllTests();
    setAllTests(tests);
    
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      setCurrentTest(test);
      
      // Small delay to show the running state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = await runSingleTest(test);
      setTestResults(prev => ({
        ...prev,
        [test.id]: result
      }));
    }
    
    setCurrentTest(null);
    setIsRunning(false);
  };

  const runSingleTest = async (test) => {
    let gitState = {
      initialized: false,
      stagedChanges: [],
      unstagedChanges: [],
      commits: [],
      branches: ['main'],
      currentBranch: 'main',
      remotes: [],
      stash: []
    };

    const results = {
      passed: true,
      commands: [],
      errors: [],
      finalState: null
    };

    try {
      // Execute each command in sequence
      for (const command of test.commands) {
        const result = simulateGitCommand(command, gitState);
        
        results.commands.push({
          command,
          output: result.output,
          success: result.success
        });

        // Update git state after each command
        gitState = result.newState || gitState;
      }
      
      results.finalState = gitState;

      // Check expectations after all commands have been executed
      if (test.expectations) {
        for (const expectation of test.expectations) {
          // Find the command output from our executed commands
          // For duplicate commands, check the last occurrence
          const commandResults = results.commands.filter(cmd => cmd.command === expectation.command);
          const commandResult = commandResults.length > 0 ? commandResults[commandResults.length - 1] : null;
          
          if (commandResult) {
            const outputMatches = commandResult.output.includes(expectation.expectedOutput);
            
            if (expectation.shouldMatch && !outputMatches) {
              results.passed = false;
              results.errors.push(
                `Expected "${expectation.expectedOutput}" in output of "${expectation.command}", but got: "${commandResult.output}"`
              );
            } else if (!expectation.shouldMatch && outputMatches) {
              results.passed = false;
              results.errors.push(
                `Did not expect "${expectation.expectedOutput}" in output of "${expectation.command}", but it was found`
              );
            }
          } else {
            // Execute the expectation command against final state
            const result = simulateGitCommand(expectation.command, gitState);
            const outputMatches = result.output.includes(expectation.expectedOutput);
            
            if (expectation.shouldMatch && !outputMatches) {
              results.passed = false;
              results.errors.push(
                `Expected "${expectation.expectedOutput}" in output of "${expectation.command}", but got: "${result.output}"`
              );
            } else if (!expectation.shouldMatch && outputMatches) {
              results.passed = false;
              results.errors.push(
                `Did not expect "${expectation.expectedOutput}" in output of "${expectation.command}", but it was found`
              );
            }
          }
        }
      }
      
      // For tests that expect failures, mark as passed if expectations are met
      const errorTestIds = ['commit-no-message', 'commit-empty', 'git-before-init', 
                           'nonexistent-branch', 'duplicate-branch', 'unknown-command', 
                           'branch-delete-current'];
      
      if (errorTestIds.includes(test.id)) {
        // These tests expect commands to fail, so we don't mark them as test failures
        // The expectations will determine if the test passes
        return results;
      }
      
      // For other tests, if no expectations and all commands succeeded, test passes
      if (!test.expectations) {
        const failedCommands = results.commands.filter(cmd => !cmd.success);
        if (failedCommands.length > 0) {
          results.passed = false;
          failedCommands.forEach(cmd => {
            results.errors.push(`Unexpected command failure: ${cmd.command} - ${cmd.output}`);
          });
        }
      }
    } catch (error) {
      results.passed = false;
      results.errors.push(`Test execution error: ${error.message}`);
    }

    return results;
  };

  const resetTests = () => {
    setTestResults({});
    setCurrentTest(null);
    setIsRunning(false);
    setAllTests([]);
  };

  const getTestSummary = () => {
    const totalTests = allTests.length;
    const completedTests = Object.keys(testResults).length;
    const passedTests = Object.values(testResults).filter(result => result.passed).length;
    const failedTests = completedTests - passedTests;

    return { totalTests, completedTests, passedTests, failedTests };
  };

  const summary = getTestSummary();

  return (
    <GitProvider>
      <div className="test-terminal-page">
        <div className="test-header">
          <h1>Git Functionality Test Suite</h1>
          <p>Comprehensive automated testing of Git commands and workflows</p>
          
          <div className="test-controls">
            <button 
              className="run-tests-btn" 
              onClick={runAllTests}
              disabled={isRunning}
            >
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </button>
            <button 
              className="reset-tests-btn" 
              onClick={resetTests}
              disabled={isRunning}
            >
              Reset Tests
            </button>
          </div>

          {summary.totalTests > 0 && (
            <div className="test-summary">
              <div className={`test-score ${summary.failedTests === 0 && summary.completedTests === summary.totalTests ? 'all-passed' : 'some-failed'}`}>
                Tests: {summary.completedTests}/{summary.totalTests} | 
                Passed: {summary.passedTests} | 
                Failed: {summary.failedTests}
              </div>
            </div>
          )}
        </div>

        <div className="test-terminal">
          {currentTest && (
            <div className="current-test-indicator">
              Running: {currentTest.suiteName} - {currentTest.name}
            </div>
          )}

          {allTests.map((test, index) => {
            const result = testResults[test.id];
            const isCurrentTest = currentTest && currentTest.id === test.id;
            
            let testClass = 'test-case';
            if (isCurrentTest) testClass += ' running';
            else if (result?.passed) testClass += ' passed';
            else if (result && !result.passed) testClass += ' failed';

            return (
              <div key={test.id} className={testClass}>
                <div className="test-info">
                  <div className="test-name">
                    <span className="test-number">#{test.testNumber}</span>
                    <span className="test-title">{test.suiteName} - {test.name}</span>
                    <span className="test-status">
                      {isCurrentTest ? '⏳' : result?.passed ? '✅' : result && !result.passed ? '❌' : '⚪'}
                    </span>
                  </div>
                  <div className="test-description">{test.description}</div>
                </div>

                {result && (
                  <div className="test-output">
                    <div className="test-commands">
                      {result.commands.map((cmd, cmdIndex) => (
                        <div key={cmdIndex} className="test-command">
                          <span className="prompt">$ </span>
                          <span className="command">{cmd.command}</span>
                        </div>
                      ))}
                    </div>

                    {result.commands.length > 0 && (
                      <div className="actual-output">
                        <strong>Output:</strong>
                        <pre>{result.commands[result.commands.length - 1]?.output || 'No output'}</pre>
                      </div>
                    )}

                    {result.errors.length > 0 && (
                      <div className="error-output">
                        <strong>Errors:</strong>
                        {result.errors.map((error, errorIndex) => (
                          <pre key={errorIndex}>{error}</pre>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {allTests.length === 0 && !isRunning && (
            <div className="current-test-indicator">
              Click "Run All Tests" to start the comprehensive Git functionality test suite.
            </div>
          )}
        </div>
      </div>
    </GitProvider>
  );
};

export default TestPage;