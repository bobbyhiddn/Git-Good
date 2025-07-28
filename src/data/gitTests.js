// Comprehensive Git workflow test cases

export const gitTestSuites = {
  basic: {
    name: "Basic Git Operations",
    description: "Test fundamental Git commands and workflows",
    tests: [
      {
        id: "init",
        name: "Repository Initialization",
        description: "Test git init functionality",
        commands: ["git init"],
        expectations: [
          { command: "git init", expectedOutput: "Initialized empty Git repository", shouldMatch: true }
        ]
      },
      {
        id: "add-commit",
        name: "Add and Commit Files",
        description: "Test adding files to staging and committing",
        commands: [
          "git init",
          "git add README.md",
          'git commit -m "Initial commit"'
        ],
        expectations: [
          { command: "git add README.md", expectedOutput: "Changes staged for commit", shouldMatch: true },
          { command: 'git commit -m "Initial commit"', expectedOutput: "Initial commit", shouldMatch: true }
        ]
      },
      {
        id: "status-log",
        name: "Status and Log Commands", 
        description: "Test git status and git log functionality",
        commands: [
          "git init",
          "git add README.md",
          'git commit -m "Test commit"',
          "git status",
          "git log"
        ],
        expectations: [
          { command: "git log", expectedOutput: "Test commit", shouldMatch: true }
        ]
      }
    ]
  },

  branching: {
    name: "Branching and Merging",
    description: "Test branch creation, switching, and merging",
    tests: [
      {
        id: "branch-create",
        name: "Branch Creation",
        description: "Test creating new branches",
        commands: [
          "git init",
          "git add README.md",
          'git commit -m "Initial commit"',
          "git branch feature-test",
          "git branch"
        ],
        expectations: [
          { command: "git branch feature-test", expectedOutput: "Created branch feature-test", shouldMatch: true },
          { command: "git branch", expectedOutput: "* main", shouldMatch: true },
          { command: "git branch", expectedOutput: "feature-test", shouldMatch: true }
        ]
      },
      {
        id: "branch-switch", 
        name: "Branch Switching",
        description: "Test switching between branches",
        commands: [
          "git init",
          "git add README.md", 
          'git commit -m "Initial commit"',
          "git checkout -b feature-branch",
          "git branch",
          "git checkout main",
          "git branch"
        ],
        expectations: [
          { command: "git checkout -b feature-branch", expectedOutput: "Switched to a new branch 'feature-branch'", shouldMatch: true },
          { command: "git checkout main", expectedOutput: "Switched to branch 'main'", shouldMatch: true }
        ]
      },
      {
        id: "branch-delete",
        name: "Branch Deletion",
        description: "Test deleting branches safely",
        commands: [
          "git init",
          "git add README.md",
          'git commit -m "Initial commit"',
          "git branch test-branch",
          "git branch -d test-branch",
          "git branch"
        ],
        expectations: [
          { command: "git branch -d test-branch", expectedOutput: "Deleted branch test-branch", shouldMatch: true },
          { command: "git branch", expectedOutput: "test-branch", shouldMatch: false }
        ]
      },
      {
        id: "branch-delete-current",
        name: "Prevent Current Branch Deletion",
        description: "Test that current branch cannot be deleted",
        commands: [
          "git init",
          "git add README.md",
          'git commit -m "Initial commit"',
          "git branch -d main"
        ],
        expectations: [
          { command: "git branch -d main", expectedOutput: "Cannot delete branch 'main'", shouldMatch: true }
        ]
      }
    ]
  },

  staging: {
    name: "Staging and Committing",
    description: "Test staging area functionality and commit workflows",
    tests: [
      {
        id: "stage-multiple",
        name: "Stage Multiple Files",
        description: "Test staging multiple files",
        commands: [
          "git init",
          "git add README.md",
          "git add package.json", 
          "git status"
        ],
        expectations: [
          { command: "git status", expectedOutput: "README.md", shouldMatch: true },
          { command: "git status", expectedOutput: "package.json", shouldMatch: true }
        ]
      },
      {
        id: "commit-no-message",
        name: "Commit Without Message",
        description: "Test that commits require messages",
        commands: [
          "git init",
          "git add README.md",
          "git commit"
        ],
        expectations: [
          { command: "git commit", expectedOutput: "Error: Commit message required", shouldMatch: true }
        ]
      },
      {
        id: "commit-empty",
        name: "Empty Commit",
        description: "Test committing with no staged changes",
        commands: [
          "git init",
          'git commit -m "Empty commit"'
        ],
        expectations: [
          { command: 'git commit -m "Empty commit"', expectedOutput: "No changes staged for commit", shouldMatch: true }
        ]
      }
    ]
  },

  remotes: {
    name: "Remote Operations", 
    description: "Test remote repository operations",
    tests: [
      {
        id: "remote-add",
        name: "Add Remote",
        description: "Test adding remote repositories",
        commands: [
          "git init",
          "git remote add origin https://github.com/user/repo.git"
        ],
        expectations: [
          { command: "git remote add origin https://github.com/user/repo.git", expectedOutput: "Remote origin updated", shouldMatch: true }
        ]
      },
      {
        id: "push-pull",
        name: "Push and Pull",
        description: "Test push and pull operations",
        commands: [
          "git init",
          "git add README.md",
          'git commit -m "Initial commit"',
          "git remote add origin https://github.com/user/repo.git",
          "git push origin main",
          "git pull origin main"
        ],
        expectations: [
          { command: "git push origin main", expectedOutput: "Pushing to origin main", shouldMatch: true },
          { command: "git pull origin main", expectedOutput: "Pulling from origin main", shouldMatch: true }
        ]
      }
    ]
  },

  stashing: {
    name: "Stashing Operations",
    description: "Test git stash functionality",
    tests: [
      {
        id: "stash-save",
        name: "Stash Changes",
        description: "Test saving changes to stash",
        commands: [
          "git init",
          "git add README.md",
          'git commit -m "Initial commit"',
          "git add package.json",
          "git stash"
        ],
        expectations: [
          { command: "git stash", expectedOutput: "Changes stashed", shouldMatch: true }
        ]
      },
      {
        id: "stash-apply",
        name: "Apply Stashed Changes",
        description: "Test applying stashed changes",
        commands: [
          "git init", 
          "git add README.md",
          'git commit -m "Initial commit"',
          "git add package.json",
          "git stash",
          "git stash apply"
        ],
        expectations: [
          { command: "git stash apply", expectedOutput: "Applied stashed changes", shouldMatch: true }
        ]
      }
    ]
  },

  unixCommands: {
    name: "Unix Commands",
    description: "Test Unix command functionality in terminal",
    tests: [
      {
        id: "ls-command",
        name: "List Directory Contents",
        description: "Test ls command functionality",
        commands: ["ls"],
        expectations: [
          { command: "ls", expectedOutput: "README.md", shouldMatch: true },
          { command: "ls", expectedOutput: "package.json", shouldMatch: true }
        ]
      },
      {
        id: "pwd-whoami",
        name: "Basic Info Commands",
        description: "Test pwd and whoami commands",
        commands: ["pwd", "whoami"],
        expectations: [
          { command: "pwd", expectedOutput: "/project", shouldMatch: true },
          { command: "whoami", expectedOutput: "developer", shouldMatch: true }
        ]
      },
      {
        id: "echo-command",
        name: "Echo Command",
        description: "Test echo command functionality",
        commands: ["echo Hello World"],
        expectations: [
          { command: "echo Hello World", expectedOutput: "Hello World", shouldMatch: true }
        ]
      },
      {
        id: "unknown-command",
        name: "Unknown Command Handling",
        description: "Test handling of unknown commands",
        commands: ["unknowncommand"],
        expectations: [
          { command: "unknowncommand", expectedOutput: "Here are your available unix commands", shouldMatch: true }
        ]
      }
    ]
  },

  errorHandling: {
    name: "Error Handling",
    description: "Test proper error handling and edge cases",
    tests: [
      {
        id: "git-before-init",
        name: "Git Commands Before Init",
        description: "Test git commands before repository initialization",
        commands: [
          "git add README.md",
          "git commit -m \"Test\""
        ],
        expectations: [
          { command: "git add README.md", expectedOutput: "Repository not initialized", shouldMatch: true },
          { command: "git commit -m \"Test\"", expectedOutput: "Repository not initialized", shouldMatch: true }
        ]
      },
      {
        id: "nonexistent-branch",
        name: "Nonexistent Branch Operations",
        description: "Test operations on branches that don't exist",
        commands: [
          "git init",
          "git checkout nonexistent-branch",
          "git branch -d nonexistent-branch"
        ],
        expectations: [
          { command: "git checkout nonexistent-branch", expectedOutput: "did not match any file(s)", shouldMatch: true },
          { command: "git branch -d nonexistent-branch", expectedOutput: "not found", shouldMatch: true }
        ]
      },
      {
        id: "duplicate-branch",
        name: "Duplicate Branch Creation",
        description: "Test creating branches that already exist",
        commands: [
          "git init",
          "git add README.md",
          'git commit -m "Initial commit"',
          "git branch test-branch",
          "git branch test-branch"
        ],
        expectations: [
          { command: "git branch test-branch", expectedOutput: "already exists", shouldMatch: true }
        ]
      }
    ]
  },

  workflow: {
    name: "Complete Workflow",
    description: "Test a complete Git workflow from start to finish",
    tests: [
      {
        id: "full-workflow",
        name: "Complete Git Workflow",
        description: "Test a full development workflow",
        commands: [
          // Initialize repository
          "git init",
          "git status",
          
          // Add initial files
          "git add README.md",
          "git add package.json", 
          'git commit -m "Initial project setup"',
          
          // Create feature branch
          "git checkout -b feature/user-auth",
          "git add src/auth.js",
          'git commit -m "Add authentication module"',
          
          // Switch back and merge
          "git checkout main",
          "git merge feature/user-auth",
          
          // Clean up
          "git branch -d feature/user-auth",
          
          // Add remote and simulate push
          "git remote add origin https://github.com/user/project.git",
          "git push origin main",
          
          // Check final status
          "git status",
          "git log"
        ],
        expectations: [
          { command: "git init", expectedOutput: "Initialized empty Git repository", shouldMatch: true },
          { command: 'git commit -m "Initial project setup"', expectedOutput: "Initial project setup", shouldMatch: true },
          { command: "git checkout -b feature/user-auth", expectedOutput: "Switched to a new branch", shouldMatch: true },
          { command: "git merge feature/user-auth", expectedOutput: "Merging feature/user-auth", shouldMatch: true },
          { command: "git branch -d feature/user-auth", expectedOutput: "Deleted branch feature/user-auth", shouldMatch: true },
          { command: "git push origin main", expectedOutput: "Pushing to origin main", shouldMatch: true }
        ]
      }
    ]
  }
};

export default gitTestSuites;