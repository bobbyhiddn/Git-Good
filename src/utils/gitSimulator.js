// Git command simulator for testing
export const simulateGitCommand = (command, gitState) => {
  const trimmedCommand = command.trim();
  const args = trimmedCommand.split(' ');
  
  // Create a copy of the state to avoid mutations
  const newState = { ...gitState };
  
  if (args[0] === 'git') {
    return simulateGitSubcommand(args.slice(1), newState);
  } else {
    // Handle Unix commands
    return simulateUnixCommand(args, newState);
  }
};

const simulateGitSubcommand = (args, gitState) => {
  const subcommand = args[0];
  
  switch (subcommand) {
    case 'init':
      if (gitState.initialized) {
        return { success: false, output: 'Repository already initialized', newState: gitState };
      }
      return { 
        success: true, 
        output: 'Initialized empty Git repository in /project/.git/', 
        newState: { ...gitState, initialized: true }
      };
    
    case 'add':
      if (!gitState.initialized) {
        return { success: false, output: 'Repository not initialized. Use "git init" first.', newState: gitState };
      }
      
      const fileName = args[1];
      if (!fileName) {
        return { success: false, output: 'Error: No file specified', newState: gitState };
      }
      
      // Add file to staged changes
      const newStagedChanges = [...gitState.stagedChanges];
      if (!newStagedChanges.includes(fileName)) {
        newStagedChanges.push(fileName);
      }
      
      return { 
        success: true, 
        output: 'Changes staged for commit', 
        newState: { ...gitState, stagedChanges: newStagedChanges }
      };
    
    case 'commit':
      if (!gitState.initialized) {
        return { success: false, output: 'Repository not initialized. Use "git init" first.', newState: gitState };
      }
      
      if (gitState.stagedChanges.length === 0) {
        return { success: false, output: 'No changes staged for commit', newState: gitState };
      }
      
      const messageFlag = args.findIndex(arg => arg === '-m');
      if (messageFlag === -1 || !args[messageFlag + 1]) {
        return { success: false, output: 'Error: Commit message required. Use -m "message"', newState: gitState };
      }
      
      // Handle quoted commit messages properly
      let commitMessage = args.slice(messageFlag + 1).join(' ');
      commitMessage = commitMessage.replace(/^["']|["']$/g, ''); // Remove surrounding quotes
      const commitHash = Math.random().toString(36).substr(2, 7);
      
      const newCommit = {
        hash: commitHash,
        message: commitMessage,
        branch: gitState.currentBranch,
        files: [...gitState.stagedChanges]
      };
      
      return { 
        success: true, 
        output: `[${gitState.currentBranch} ${commitHash}] ${commitMessage}`, 
        newState: { 
          ...gitState, 
          commits: [...gitState.commits, newCommit],
          stagedChanges: []
        }
      };
    
    case 'status':
      if (!gitState.initialized) {
        return { success: false, output: 'Repository not initialized. Use "git init" first.', newState: gitState };
      }
      
      let statusOutput = `On branch ${gitState.currentBranch}\n`;
      
      if (gitState.stagedChanges.length > 0) {
        statusOutput += '\nChanges to be committed:\n';
        gitState.stagedChanges.forEach(file => {
          statusOutput += `\tnew file:   ${file}\n`;
        });
      } else {
        statusOutput += '\nStaged changes: None\n';
      }
      
      if (gitState.unstagedChanges.length > 0) {
        statusOutput += '\nChanges not staged for commit:\n';
        gitState.unstagedChanges.forEach(file => {
          statusOutput += `\tmodified:   ${file}\n`;
        });
      }
      
      if (gitState.stagedChanges.length === 0 && gitState.unstagedChanges.length === 0) {
        statusOutput += 'nothing to commit, working tree clean';
      }
      
      return { success: true, output: statusOutput, newState: gitState };
    
    case 'log':
      if (!gitState.initialized) {
        return { success: false, output: 'Repository not initialized. Use "git init" first.', newState: gitState };
      }
      
      if (gitState.commits.length === 0) {
        return { success: true, output: 'No commits yet', newState: gitState };
      }
      
      let logOutput = '';
      gitState.commits.slice().reverse().forEach(commit => {
        logOutput += `commit ${commit.hash}\n`;
        logOutput += `    ${commit.message}\n\n`;
      });
      
      return { success: true, output: logOutput.trim(), newState: gitState };
    
    case 'branch':
      if (!gitState.initialized) {
        return { success: false, output: 'Repository not initialized. Use "git init" first.', newState: gitState };
      }
      
      if (args[1] === '-d') {
        const branchToDelete = args[2];
        if (!branchToDelete) {
          return { success: false, output: 'Error: Branch name required', newState: gitState };
        }
        
        if (branchToDelete === gitState.currentBranch) {
          return { success: false, output: `Error: Cannot delete branch '${branchToDelete}' checked out at HEAD`, newState: gitState };
        }
        
        if (!gitState.branches.includes(branchToDelete)) {
          return { success: false, output: `Error: branch '${branchToDelete}' not found`, newState: gitState };
        }
        
        const newBranches = gitState.branches.filter(b => b !== branchToDelete);
        return { 
          success: true, 
          output: `Deleted branch ${branchToDelete}`, 
          newState: { ...gitState, branches: newBranches }
        };
      } else if (args[1]) {
        // Create new branch
        const newBranchName = args[1];
        if (gitState.branches.includes(newBranchName)) {
          return { success: false, output: `Error: A branch named '${newBranchName}' already exists`, newState: gitState };
        }
        
        const newBranches = [...gitState.branches, newBranchName];
        return { 
          success: true, 
          output: `Created branch ${newBranchName}`, 
          newState: { ...gitState, branches: newBranches }
        };
      } else {
        // List branches
        let branchOutput = '';
        gitState.branches.forEach(branch => {
          if (branch === gitState.currentBranch) {
            branchOutput += `* ${branch}\n`;
          } else {
            branchOutput += `  ${branch}\n`;
          }
        });
        return { success: true, output: branchOutput.trim(), newState: gitState };
      }
    
    case 'checkout':
      if (!gitState.initialized) {
        return { success: false, output: 'Repository not initialized. Use "git init" first.', newState: gitState };
      }
      
      if (args[1] === '-b') {
        // Create and switch to new branch
        const newBranchName = args[2];
        if (!newBranchName) {
          return { success: false, output: 'Error: Branch name required', newState: gitState };
        }
        
        if (gitState.branches.includes(newBranchName)) {
          return { success: false, output: `Error: A branch named '${newBranchName}' already exists`, newState: gitState };
        }
        
        const newBranches = [...gitState.branches, newBranchName];
        return { 
          success: true, 
          output: `Switched to a new branch '${newBranchName}'`, 
          newState: { ...gitState, branches: newBranches, currentBranch: newBranchName }
        };
      } else {
        // Switch to existing branch
        const branchName = args[1];
        if (!branchName) {
          return { success: false, output: 'Error: Branch name required', newState: gitState };
        }
        
        if (!gitState.branches.includes(branchName)) {
          return { success: false, output: `Error: pathspec '${branchName}' did not match any file(s) known to git`, newState: gitState };
        }
        
        return { 
          success: true, 
          output: `Switched to branch '${branchName}'`, 
          newState: { ...gitState, currentBranch: branchName }
        };
      }
    
    case 'merge':
      if (!gitState.initialized) {
        return { success: false, output: 'Repository not initialized. Use "git init" first.', newState: gitState };
      }
      
      const branchToMerge = args[1];
      if (!branchToMerge) {
        return { success: false, output: 'Error: Branch name required', newState: gitState };
      }
      
      if (!gitState.branches.includes(branchToMerge)) {
        return { success: false, output: `Error: branch '${branchToMerge}' not found`, newState: gitState };
      }
      
      return { 
        success: true, 
        output: `Merging ${branchToMerge} into ${gitState.currentBranch}`, 
        newState: gitState
      };
    
    case 'remote':
      if (!gitState.initialized) {
        return { success: false, output: 'Repository not initialized. Use "git init" first.', newState: gitState };
      }
      
      if (args[1] === 'add') {
        const remoteName = args[2];
        const remoteUrl = args[3];
        
        if (!remoteName || !remoteUrl) {
          return { success: false, output: 'Error: Remote name and URL required', newState: gitState };
        }
        
        const newRemotes = [...gitState.remotes, { name: remoteName, url: remoteUrl }];
        return { 
          success: true, 
          output: `Remote ${remoteName} updated`, 
          newState: { ...gitState, remotes: newRemotes }
        };
      }
      
      return { success: true, output: 'Remote operations', newState: gitState };
    
    case 'push':
      if (!gitState.initialized) {
        return { success: false, output: 'Repository not initialized. Use "git init" first.', newState: gitState };
      }
      
      const remoteName = args[1];
      const branchName = args[2];
      
      if (!remoteName || !branchName) {
        return { success: false, output: 'Error: Remote and branch required', newState: gitState };
      }
      
      return { 
        success: true, 
        output: `Pushing to ${remoteName} ${branchName}`, 
        newState: gitState
      };
    
    case 'pull':
      if (!gitState.initialized) {
        return { success: false, output: 'Repository not initialized. Use "git init" first.', newState: gitState };
      }
      
      const pullRemote = args[1];
      const pullBranch = args[2];
      
      if (!pullRemote || !pullBranch) {
        return { success: false, output: 'Error: Remote and branch required', newState: gitState };
      }
      
      return { 
        success: true, 
        output: `Pulling from ${pullRemote} ${pullBranch}`, 
        newState: gitState
      };
    
    case 'stash':
      if (!gitState.initialized) {
        return { success: false, output: 'Repository not initialized. Use "git init" first.', newState: gitState };
      }
      
      if (args[1] === 'apply') {
        if (gitState.stash.length === 0) {
          return { success: false, output: 'No stash entries found', newState: gitState };
        }
        
        return { 
          success: true, 
          output: 'Applied stashed changes', 
          newState: gitState
        };
      } else {
        // Stash changes - can stash staged changes
        if (gitState.stagedChanges.length === 0 && gitState.unstagedChanges.length === 0) {
          return { success: false, output: 'No local changes to save', newState: gitState };
        }
        
        const newStash = [...gitState.stash, { changes: [...gitState.stagedChanges, ...gitState.unstagedChanges] }];
        return { 
          success: true, 
          output: 'Changes stashed', 
          newState: { ...gitState, stash: newStash, stagedChanges: [], unstagedChanges: [] }
        };
      }
    
    default:
      return { success: false, output: `git: '${subcommand}' is not a git command`, newState: gitState };
  }
};

const simulateUnixCommand = (args, gitState) => {
  const command = args[0];
  
  switch (command) {
    case 'ls':
    case 'll':
      const files = ['README.md', 'package.json', 'src'];
      if (gitState.initialized) {
        files.unshift('.git');
      }
      return { success: true, output: files.join('\n'), newState: gitState };
    
    case 'pwd':
      return { success: true, output: '/project', newState: gitState };
    
    case 'whoami':
      return { success: true, output: 'developer', newState: gitState };
    
    case 'echo':
      const message = args.slice(1).join(' ');
      return { success: true, output: message, newState: gitState };
    
    case 'clear':
      return { success: true, output: '', newState: gitState };
    
    case 'touch':
      const fileName = args[1];
      if (!fileName) {
        return { success: false, output: 'Error: File name required', newState: gitState };
      }
      return { success: true, output: `Created file: ${fileName}`, newState: gitState };
    
    case 'mkdir':
      const dirName = args[1];
      if (!dirName) {
        return { success: false, output: 'Error: Directory name required', newState: gitState };
      }
      return { success: true, output: `Created directory: ${dirName}`, newState: gitState };
    
    default:
      const availableCommands = ['ls', 'll', 'pwd', 'whoami', 'echo', 'clear', 'touch', 'mkdir'];
      return { 
        success: false, 
        output: `Command not found: ${command}\nHere are your available unix commands in this terminal emulator:\n${availableCommands.join(', ')}`, 
        newState: gitState 
      };
  }
};