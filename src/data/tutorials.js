// Tutorial data structure and comprehensive scenarios

export const tutorials = {
  'first-commit': {
    id: 'first-commit',
    title: 'Your First Commit',
    description: 'Learn the basics: init, add, and commit your first changes.',
    difficulty: 'beginner',
    duration: '5 min',
    steps: [
      {
        instruction: "Welcome! Let's start by initializing a new Git repository. This creates a .git folder to track your project.",
        command: 'git init',
        expectedOutput: 'Initialized empty Git repository',
        explanation: "git init creates a new Git repository in the current directory. You'll see a .git folder appear in the file explorer."
      },
      {
        instruction: "Great! Now let's check the status of our repository to see what files Git is tracking.",
        command: 'git status',
        expectedOutput: 'On branch main',
        explanation: "git status shows the current state of your repository - which files are tracked, modified, or staged."
      },
      {
        instruction: "Let's add the README.md file to the staging area. This prepares it to be committed.",
        command: 'git add README.md',
        expectedOutput: 'Changes staged for commit',
        explanation: "git add moves files to the staging area. Notice how README.md now shows as staged (✓) in the file explorer."
      },
      {
        instruction: "Perfect! Now let's check the status again to see our staged changes.",
        command: 'git status',
        expectedOutput: 'Staged changes: README.md',
        explanation: "You can see that README.md is now staged and ready to be committed."
      },
      {
        instruction: 'Time to make your first commit! This saves a snapshot of your staged changes.',
        command: 'git commit -m "Initial commit with README"',
        expectedOutput: 'Initial commit with README',
        explanation: "git commit saves your staged changes permanently to the repository history. The -m flag adds a descriptive message."
      },
      {
        instruction: "Excellent! Let's view our commit history to see what we've accomplished.",
        command: 'git log',
        expectedOutput: 'Initial commit with README',
        explanation: "git log shows the history of commits. You can see your first commit with its message and unique ID."
      }
    ],
    initialState: {
      initialized: false,
      currentBranch: 'main',
      branches: ['main'],
      commits: [],
      stagedChanges: [],
      remotes: {},
      stash: [],
      untrackedFiles: []
    }
  },

  'recovery': {
    id: 'recovery',
    title: 'Recovery & Mistake Management',
    description: 'Master git revert, stash, pull from remote, and how to recover from common mistakes.',
    difficulty: 'intermediate',
    duration: '15 min',
    steps: [
      {
        instruction: "Welcome to Recovery 101! Let's start with a repository that has some history. First, initialize and make some commits.",
        command: 'git init',
        expectedOutput: 'Initialized empty Git repository',
        explanation: "We're starting fresh. In real scenarios, you'd already have a repository with history."
      },
      {
        instruction: "Let's add and commit a file to establish some history.",
        command: 'git add README.md',
        expectedOutput: 'Changes staged for commit',
        explanation: "Setting up our initial state."
      },
      {
        instruction: "Commit our first change.",
        command: 'git commit -m "Add README file"',
        expectedOutput: 'Add README file',
        explanation: "Now we have a baseline commit to work from."
      },
      {
        instruction: "Let's add another file and commit it.",
        command: 'git add package.json',
        expectedOutput: 'Changes staged for commit',
        explanation: "Adding more content to our repository."
      },
      {
        instruction: "Commit the package file.",
        command: 'git commit -m "Add package.json - this commit has a bug!"',
        expectedOutput: 'Add package.json - this commit has a bug!',
        explanation: "Uh oh! This commit introduces a bug. We'll need to fix this."
      },
      {
        instruction: "Now let's say you realized that last commit was problematic. Use git revert to safely undo it without losing history.",
        command: 'git revert HEAD',
        expectedOutput: 'Revert \"Add package.json - this commit has a bug!\"',
        explanation: "git revert creates a NEW commit that undoes the changes from the specified commit. This is safer than deleting history."
      },
      {
        instruction: "Let's check our commit history to see what happened.",
        command: 'git log',
        expectedOutput: 'Revert',
        explanation: "Notice how we now have 3 commits: the original, the buggy one, and the revert. History is preserved!"
      },
      {
        instruction: "Now let's learn about stashing. Start working on something new by adding a file.",
        command: 'git add src/app.js',
        expectedOutput: 'Changes staged for commit',
        explanation: "Let's say you're working on a new feature but need to quickly switch contexts."
      },
      {
        instruction: "Oh no! You need to switch to another task urgently. Let's stash your work in progress.",
        command: 'git stash',
        expectedOutput: 'Changes stashed',
        explanation: "git stash temporarily saves your changes and cleans your working directory. Your work is safe!"
      },
      {
        instruction: "Check the status - your working directory should be clean now.",
        command: 'git status',
        expectedOutput: 'nothing to commit, working tree clean',
        explanation: "The stash has temporarily stored your changes. You can now safely switch branches or pull updates."
      },
      {
        instruction: "Now let's simulate pulling from a remote repository.",
        command: 'git pull origin main',
        expectedOutput: 'Pulling from origin main',
        explanation: "git pull fetches and merges changes from the remote repository. Always pull before pushing your work!"
      },
      {
        instruction: "Great! Now let's restore your stashed work.",
        command: 'git stash apply',
        expectedOutput: 'Applied stashed changes',
        explanation: "git stash apply restores your previously stashed changes. Now you can continue working where you left off."
      },
      {
        instruction: "Let's check what happened to our files.",
        command: 'git status',
        expectedOutput: 'Staged changes',
        explanation: "Your stashed changes are back! The file you were working on is staged again."
      },
      {
        instruction: "Perfect! Now you know how to recover from mistakes and manage work in progress. Let's make our final commit.",
        command: 'git commit -m "Complete new feature after recovery"',
        expectedOutput: 'Complete new feature after recovery',
        explanation: "Recovery complete! You've learned revert (undo commits safely), stash (save work temporarily), and pull (get remote updates)."
      }
    ],
    initialState: {
      initialized: false,
      currentBranch: 'main',
      branches: ['main'],
      commits: [],
      stagedChanges: [],
      remotes: { origin: 'https://github.com/user/repo.git' },
      stash: []
    }
  },

  'remote-management': {
    id: 'remote-management',
    title: 'Remote Repository Management',
    description: 'Learn about remotes, pushing, pulling, and recovering using remote repositories.',
    difficulty: 'intermediate',
    duration: '12 min',
    steps: [
      {
        instruction: "Welcome to Remote Management! Let's start with an existing repository and learn how to work with remotes.",
        command: 'git init',
        expectedOutput: 'Initialized empty Git repository',
        explanation: "Starting with a local repository. In practice, you might clone from a remote instead."
      },
      {
        instruction: "Let's add a remote repository. This connects your local repo to a server (like GitHub).",
        command: 'git remote add origin https://github.com/user/my-project.git',
        expectedOutput: 'Remote origin updated',
        explanation: "git remote add creates a connection to a remote repository. 'origin' is the conventional name for your main remote."
      },
      {
        instruction: "Let's see what remotes we have configured.",
        command: 'git remote -v',
        expectedOutput: 'origin',
        explanation: "git remote -v lists all configured remotes and their URLs. You can have multiple remotes for different purposes."
      },
      {
        instruction: "Now let's create some content to push. Add and commit a file.",
        command: 'git add README.md',
        expectedOutput: 'Changes staged for commit',
        explanation: "We need some commits to push to the remote."
      },
      {
        instruction: "Commit our initial content.",
        command: 'git commit -m "Initial commit for remote repository"',
        expectedOutput: 'Initial commit for remote repository',
        explanation: "Now we have local commits that we can push to the remote."
      },
      {
        instruction: "Let's push our commits to the remote repository.",
        command: 'git push origin main',
        expectedOutput: 'Pushing to origin main',
        explanation: "git push uploads your local commits to the remote repository, making them available to others."
      },
      {
        instruction: "Now let's simulate a scenario where the remote has new changes. Pull from the remote.",
        command: 'git pull origin main',
        expectedOutput: 'Pulling from origin main',
        explanation: "git pull downloads new commits from the remote and merges them into your local branch."
      },
      {
        instruction: "Let's create a backup remote - useful for recovery scenarios.",
        command: 'git remote add backup https://github.com/user/my-project-backup.git',
        expectedOutput: 'Remote backup updated',
        explanation: "Having multiple remotes is a great backup strategy. You can push to multiple locations."
      },
      {
        instruction: "List all remotes to see our setup.",
        command: 'git remote -v',
        expectedOutput: 'origin',
        explanation: "Now you have two remotes: 'origin' for your main repository and 'backup' for safety."
      },
      {
        instruction: "Let's say you accidentally deleted your local repository. You can recover by cloning from the remote.",
        command: 'git clone https://github.com/user/my-project.git recovered-project',
        expectedOutput: 'Cloning into \'recovered-project\'',
        explanation: "git clone creates a complete copy of a remote repository. This is how you recover from local disasters!"
      },
      {
        instruction: "If you need to change where a remote points to, you can update the URL.",
        command: 'git remote set-url origin https://github.com/user/new-project.git',
        expectedOutput: 'Remote origin updated',
        explanation: "git remote set-url changes where a remote points. Useful when repositories move or you fork a project."
      },
      {
        instruction: "Let's check our final remote configuration.",
        command: 'git remote -v',
        expectedOutput: 'origin',
        explanation: "Perfect! You now understand how to manage remotes, push/pull changes, and use remotes for recovery."
      }
    ],
    initialState: {
      initialized: false,
      currentBranch: 'main',
      branches: ['main'],
      commits: [],
      stagedChanges: [],
      remotes: {},
      stash: [],
      untrackedFiles: []
    }
  },

  'branching-merging': {
    id: 'branching-merging',
    title: 'Branching and Merging',
    description: 'Master branch creation, switching, and merging workflows.',
    difficulty: 'intermediate',
    duration: '10 min',
    steps: [
      {
        instruction: "Welcome to Branching & Merging! Let's start with a repository and learn how to work with branches.",
        command: 'git init',
        expectedOutput: 'Initialized empty Git repository',
        explanation: "Branches allow you to work on features in isolation without affecting the main codebase."
      },
      {
        instruction: "Let's create some initial content and commit it.",
        command: 'git add README.md',
        expectedOutput: 'Changes staged for commit',
        explanation: "We need a base commit before we can create branches."
      },
      {
        instruction: "Commit our initial content.",
        command: 'git commit -m "Initial commit on main branch"',
        expectedOutput: 'Initial commit on main branch',
        explanation: "Now we have a main branch with content. This is our stable baseline."
      },
      {
        instruction: "Let's see what branches we have. The asterisk (*) shows your current branch.",
        command: 'git branch',
        expectedOutput: '* main',
        explanation: "git branch lists all local branches. Currently we only have 'main'."
      },
      {
        instruction: "Now let's create a new branch for developing a feature.",
        command: 'git branch feature-login',
        expectedOutput: 'Created branch feature-login',
        explanation: "git branch <name> creates a new branch but doesn't switch to it yet."
      },
      {
        instruction: "Let's see our branches now.",
        command: 'git branch',
        expectedOutput: '  feature-login\n* main',
        explanation: "Now we have two branches, but we're still on main (indicated by the asterisk)."
      },
      {
        instruction: "Switch to the new feature branch.",
        command: 'git checkout feature-login',
        expectedOutput: 'Switched to branch \'feature-login\'',
        explanation: "git checkout switches your working directory to the specified branch."
      },
      {
        instruction: "Let's verify we're on the right branch.",
        command: 'git branch',
        expectedOutput: '* feature-login\n  main',
        explanation: "Perfect! Now we're on the feature-login branch (indicated by the asterisk)."
      },
      {
        instruction: "Let's work on our feature by adding some code.",
        command: 'git add src/login.js',
        expectedOutput: 'Changes staged for commit',
        explanation: "We're adding feature-specific code. This won't affect the main branch."
      },
      {
        instruction: "Commit our feature work.",
        command: 'git commit -m "Add login functionality"',
        expectedOutput: 'Add login functionality',
        explanation: "This commit only exists on the feature-login branch. The main branch is unchanged."
      },
      {
        instruction: "Let's switch back to main to see the difference.",
        command: 'git checkout main',
        expectedOutput: 'Switched to branch \'main\'',
        explanation: "Notice how the files change when you switch branches - login.js isn't here!"
      },
      {
        instruction: "Check the status on main branch.",
        command: 'git status',
        expectedOutput: 'On branch main',
        explanation: "We're back on main, and the feature work isn't visible here. Branches keep work separate!"
      },
      {
        instruction: "Now let's merge our feature into main. This brings the feature work into the main branch.",
        command: 'git merge feature-login',
        expectedOutput: 'Merging feature-login into main',
        explanation: "git merge combines the changes from feature-login into the current branch (main)."
      },
      {
        instruction: "Let's see our commit history now.",
        command: 'git log',
        expectedOutput: 'Add login functionality',
        explanation: "The feature commit is now part of main's history. The feature has been successfully integrated!"
      },
      {
        instruction: "Now that the feature is merged, we can safely delete the feature branch.",
        command: 'git branch -d feature-login',
        expectedOutput: 'Deleted branch feature-login',
        explanation: "git branch -d deletes a branch that has been fully merged. This keeps your branch list clean."
      },
      {
        instruction: "Let's verify the branch is gone.",
        command: 'git branch',
        expectedOutput: '* main',
        explanation: "Perfect! You've learned the complete branch workflow: create, work, merge, and cleanup."
      }
    ],
    initialState: {
      initialized: false,
      currentBranch: 'main',
      branches: ['main'],
      commits: [],
      stagedChanges: [],
      remotes: {},
      stash: [],
      untrackedFiles: []
    }
  },

  'merge-conflicts': {
    id: 'merge-conflicts',
    title: 'Fixing Merge Conflicts',
    description: 'Learn how to resolve conflicts when merging branches.',
    difficulty: 'intermediate',
    duration: '15 min',
    steps: [
      {
        instruction: "Welcome to Merge Conflict Resolution! Let's create a scenario where two branches modify the same file.",
        command: 'git init',
        expectedOutput: 'Initialized empty Git repository',
        explanation: "Merge conflicts happen when two branches change the same part of a file differently."
      },
      {
        instruction: "Create initial content and commit it.",
        command: 'git add README.md',
        expectedOutput: 'Changes staged for commit',
        explanation: "We need a base file that both branches will modify."
      },
      {
        instruction: "Commit our base content.",
        command: 'git commit -m "Add README with initial content"',
        expectedOutput: 'Add README with initial content',
        explanation: "This creates our starting point. Both branches will diverge from here."
      },
      {
        instruction: "Create a feature branch for new documentation.",
        command: 'git checkout -b feature-docs',
        expectedOutput: 'Switched to a new branch \'feature-docs\'',
        explanation: "git checkout -b creates and switches to a new branch in one command."
      },
      {
        instruction: "Let's modify the README in this branch (simulated change to line 5).",
        command: 'git add README.md',
        expectedOutput: 'Changes staged for commit',
        explanation: "We're modifying the README on the feature-docs branch."
      },
      {
        instruction: "Commit the documentation changes.",
        command: 'git commit -m "Update README with detailed documentation"',
        expectedOutput: 'Update README with detailed documentation',
        explanation: "This commit modifies the README on the feature-docs branch."
      },
      {
        instruction: "Switch back to main to make conflicting changes.",
        command: 'git checkout main',
        expectedOutput: 'Switched to branch \'main\'',
        explanation: "Now we'll modify the same file on main, creating a potential conflict."
      },
      {
        instruction: "Modify the README differently on main (simulated change to same line).",
        command: 'git add README.md',
        expectedOutput: 'Changes staged for commit',
        explanation: "We're modifying the same part of README.md that we changed on feature-docs."
      },
      {
        instruction: "Commit the main branch changes.",
        command: 'git commit -m "Update README with installation instructions"',
        expectedOutput: 'Update README with installation instructions',
        explanation: "Now both branches have different changes to the same file. This will cause a conflict!"
      },
      {
        instruction: "Now let's try to merge feature-docs into main. This will create a conflict!",
        command: 'git merge feature-docs',
        expectedOutput: 'CONFLICT (content): Merge conflict in README.md',
        explanation: "Git detected that both branches modified the same part of README.md and can't automatically merge them."
      },
      {
        instruction: "Check the status to see what's conflicted.",
        command: 'git status',
        expectedOutput: 'Unmerged paths',
        explanation: "Git shows which files have conflicts. README.md needs manual resolution."
      },
      {
        instruction: "In real life, you'd edit the file to resolve conflicts. Let's simulate resolving it.",
        command: 'git add README.md',
        expectedOutput: 'Changes staged for commit',
        explanation: "After manually editing the file to resolve conflicts, you stage it to mark the conflict as resolved."
      },
      {
        instruction: "Complete the merge by committing.",
        command: 'git commit -m "Merge feature-docs: resolve README conflicts"',
        expectedOutput: 'Merge feature-docs: resolve README conflicts',
        explanation: "This completes the merge. The conflict is resolved and both sets of changes are combined."
      },
      {
        instruction: "Let's see our merge history.",
        command: 'git log',
        expectedOutput: 'Merge feature-docs',
        explanation: "You can see the merge commit that combined both branches. Conflicts are now resolved!"
      },
      {
        instruction: "Clean up by deleting the merged branch.",
        command: 'git branch -d feature-docs',
        expectedOutput: 'Deleted branch feature-docs',
        explanation: "Excellent! You've learned how to handle merge conflicts: identify, resolve manually, stage, and commit."
      }
    ],
    initialState: {
      initialized: false,
      currentBranch: 'main',
      branches: ['main'],
      commits: [],
      stagedChanges: [],
      remotes: {},
      stash: [],
      untrackedFiles: []
    }
  },

  'collaborative-workflow': {
    id: 'collaborative-workflow',
    title: 'Collaborative Workflow',
    description: 'Practice working with remotes, pull requests, and team workflows.',
    difficulty: 'advanced',
    duration: '20 min',
    steps: [
      {
        instruction: "Welcome to Collaborative Git! Let's simulate working with a team on a shared repository.",
        command: 'git clone https://github.com/team/shared-project.git',
        expectedOutput: 'Cloning into \'shared-project\'',
        explanation: "In team development, you typically start by cloning a shared repository."
      },
      {
        instruction: "Let's see what remotes we have.",
        command: 'git remote -v',
        expectedOutput: 'origin',
        explanation: "The clone automatically set up 'origin' pointing to the shared repository."
      },
      {
        instruction: "Check what branches are available.",
        command: 'git branch -a',
        expectedOutput: 'main',
        explanation: "git branch -a shows all branches, including remote ones. You can see what others are working on."
      },
      {
        instruction: "Before starting work, always get the latest changes from the team.",
        command: 'git pull origin main',
        expectedOutput: 'Pulling from origin main',
        explanation: "git pull fetches and merges the latest changes from the remote. Always do this before starting new work!"
      },
      {
        instruction: "Create a feature branch for your work. Use descriptive names!",
        command: 'git checkout -b feature/user-authentication',
        expectedOutput: 'Switched to a new branch \'feature/user-authentication\'',
        explanation: "Feature branches keep your work isolated. Use prefixes like 'feature/', 'bugfix/', 'hotfix/' for clarity."
      },
      {
        instruction: "Let's work on our feature by adding some code.",
        command: 'git add src/auth.js',
        expectedOutput: 'Changes staged for commit',
        explanation: "Develop your feature in small, logical commits. This makes review easier."
      },
      {
        instruction: "Make a focused commit with a clear message.",
        command: 'git commit -m "Add user authentication module"',
        expectedOutput: 'Add user authentication module',
        explanation: "Good commit messages help your team understand what changed and why."
      },
      {
        instruction: "Add tests for your feature.",
        command: 'git add tests/auth.test.js',
        expectedOutput: 'Changes staged for commit',
        explanation: "Always include tests with your features. This helps maintain code quality."
      },
      {
        instruction: "Commit the tests.",
        command: 'git commit -m "Add tests for user authentication"',
        expectedOutput: 'Add tests for user authentication',
        explanation: "Separate commits for tests make it easier to review and understand changes."
      },
      {
        instruction: "Before pushing, let's make sure we have the latest changes from main.",
        command: 'git checkout main',
        expectedOutput: 'Switched to branch \'main\'',
        explanation: "Switch back to main to pull the latest changes from your team."
      },
      {
        instruction: "Pull the latest changes from the remote.",
        command: 'git pull origin main',
        expectedOutput: 'Pulling from origin main',
        explanation: "Your teammates might have pushed changes while you were working."
      },
      {
        instruction: "Switch back to your feature branch.",
        command: 'git checkout feature/user-authentication',
        expectedOutput: 'Switched to branch \'feature/user-authentication\'',
        explanation: "Now we'll integrate the latest main changes into our feature branch."
      },
      {
        instruction: "Rebase your feature branch onto the latest main. This keeps history clean.",
        command: 'git rebase main',
        expectedOutput: 'Rebasing feature/user-authentication onto main',
        explanation: "git rebase replays your commits on top of the latest main. This creates a linear history."
      },
      {
        instruction: "Now push your feature branch to the remote for review.",
        command: 'git push origin feature/user-authentication',
        expectedOutput: 'Pushing to origin feature/user-authentication',
        explanation: "Push your feature branch so teammates can review it. This doesn't affect main yet."
      },
      {
        instruction: "After code review and approval, merge your feature into main.",
        command: 'git checkout main',
        expectedOutput: 'Switched to branch \'main\'',
        explanation: "Switch to main to merge your approved feature."
      },
      {
        instruction: "Merge the feature branch.",
        command: 'git merge feature/user-authentication',
        expectedOutput: 'Merging feature/user-authentication into main',
        explanation: "The merge brings your feature into main. In practice, this might be done via pull request."
      },
      {
        instruction: "Push the updated main branch.",
        command: 'git push origin main',
        expectedOutput: 'Pushing to origin main',
        explanation: "Share your merged feature with the team by pushing to the remote main branch."
      },
      {
        instruction: "Clean up by deleting the merged feature branch.",
        command: 'git branch -d feature/user-authentication',
        expectedOutput: 'Deleted branch feature/user-authentication',
        explanation: "Clean up merged branches to keep your workspace organized."
      },
      {
        instruction: "Also delete the remote feature branch.",
        command: 'git push origin --delete feature/user-authentication',
        expectedOutput: 'Deleted remote branch feature/user-authentication',
        explanation: "Perfect! You've completed a full collaborative workflow: branch, develop, review, merge, and cleanup."
      }
    ],
    initialState: {
      initialized: true,
      currentBranch: 'main',
      branches: ['main'],
      commits: [{ id: 'abc123', message: 'Initial team setup' }],
      stagedChanges: [],
      remotes: { origin: 'https://github.com/team/shared-project.git' },
      stash: []
    }
  },

  'stashing-cleaning': {
    id: 'stashing-cleaning',
    title: 'Stashing and Cleaning',
    description: 'Learn to temporarily save work and clean your working directory.',
    difficulty: 'beginner',
    duration: '8 min',
    steps: [
      {
        instruction: "Welcome to Stashing & Cleaning! Let's learn how to temporarily save work and manage your workspace.",
        command: 'git init',
        expectedOutput: 'Initialized empty Git repository',
        explanation: "Stashing is useful when you need to quickly switch contexts but aren't ready to commit."
      },
      {
        instruction: "Create some initial content and commit it.",
        command: 'git add README.md',
        expectedOutput: 'Changes staged for commit',
        explanation: "We need a base commit to work from."
      },
      {
        instruction: "Make our initial commit.",
        command: 'git commit -m "Initial commit"',
        expectedOutput: 'Initial commit',
        explanation: "Now we have a clean starting point."
      },
      {
        instruction: "Let's start working on a feature by adding a new file.",
        command: 'git add src/feature.js',
        expectedOutput: 'Changes staged for commit',
        explanation: "You're in the middle of developing a feature when something urgent comes up."
      },
      {
        instruction: "Also modify an existing file.",
        command: 'git add README.md',
        expectedOutput: 'Changes staged for commit',
        explanation: "Now you have both staged and unstaged changes. What if you need to switch tasks?"
      },
      {
        instruction: "Urgent! You need to fix a bug but your current work isn't ready. Let's stash it.",
        command: 'git stash',
        expectedOutput: 'Changes stashed',
        explanation: "git stash saves your current work (staged and unstaged) and gives you a clean working directory."
      },
      {
        instruction: "Check the status - your working directory should be clean now.",
        command: 'git status',
        expectedOutput: 'nothing to commit, working tree clean',
        explanation: "Perfect! Your work is safely stored and you have a clean workspace for the urgent task."
      },
      {
        instruction: "Let's see what's in our stash.",
        command: 'git stash list',
        expectedOutput: 'stash@{0}',
        explanation: "git stash list shows all your stashed work. Each stash has an identifier."
      },
      {
        instruction: "Now you can safely work on the urgent bug fix.",
        command: 'git add bugfix.js',
        expectedOutput: 'Changes staged for commit',
        explanation: "You can work on the urgent task without worrying about your previous work."
      },
      {
        instruction: "Commit the urgent fix.",
        command: 'git commit -m "Fix urgent bug in production"',
        expectedOutput: 'Fix urgent bug in production',
        explanation: "The urgent task is done. Now let's get back to your original work."
      },
      {
        instruction: "Restore your stashed work.",
        command: 'git stash apply',
        expectedOutput: 'Applied stashed changes',
        explanation: "git stash apply restores your stashed changes. You can continue where you left off!"
      },
      {
        instruction: "Check the status to see your restored work.",
        command: 'git status',
        expectedOutput: 'Staged changes',
        explanation: "Your previous work is back! Notice that staged changes remain staged."
      },
      {
        instruction: "If you're happy with the restored changes, you can drop the stash.",
        command: 'git stash drop',
        expectedOutput: 'Dropped refs/stash@{0}',
        explanation: "git stash drop removes the stash entry. Use this when you no longer need the stashed changes."
      },
      {
        instruction: "Complete your feature work.",
        command: 'git commit -m "Complete feature implementation"',
        expectedOutput: 'Complete feature implementation',
        explanation: "Excellent! You've learned how to use stashing to temporarily save work and switch contexts safely."
      }
    ],
    initialState: {
      initialized: false,
      currentBranch: 'main',
      branches: ['main'],
      commits: [],
      stagedChanges: [],
      remotes: {},
      stash: [],
      untrackedFiles: []
    }
  },

  'rewriting-history': {
    id: 'rewriting-history',
    title: 'Rewriting History',
    description: 'Master rebasing, squashing, and other history manipulation techniques.',
    difficulty: 'advanced',
    duration: '25 min',
    steps: [
      {
        instruction: "Welcome to History Rewriting! ⚠️ WARNING: These commands change history and should be used carefully.",
        command: 'git init',
        expectedOutput: 'Initialized empty Git repository',
        explanation: "History rewriting is powerful but dangerous. Never rewrite shared/pushed history!"
      },
      {
        instruction: "Let's create some commits with messy history that we'll clean up.",
        command: 'git add README.md',
        expectedOutput: 'Changes staged for commit',
        explanation: "We'll create several small commits that would be better as one clean commit."
      },
      {
        instruction: "Make our first commit.",
        command: 'git commit -m "Add README"',
        expectedOutput: 'Add README',
        explanation: "First commit in our series."
      },
      {
        instruction: "Add another small change.",
        command: 'git add package.json',
        expectedOutput: 'Changes staged for commit',
        explanation: "Another small commit that's part of the same logical change."
      },
      {
        instruction: "Make another commit.",
        command: 'git commit -m "Add package.json"',
        expectedOutput: 'Add package.json',
        explanation: "This commit is related to the previous one - they could be combined."
      },
      {
        instruction: "Fix a typo (oops!).",
        command: 'git add README.md',
        expectedOutput: 'Changes staged for commit',
        explanation: "A small fix that should have been part of the original README commit."
      },
      {
        instruction: "Commit the typo fix.",
        command: 'git commit -m "Fix typo in README"',
        expectedOutput: 'Fix typo in README',
        explanation: "Now we have 3 commits that could be 1 clean commit. Let's fix this!"
      },
      {
        instruction: "Let's see our messy history.",
        command: 'git log',
        expectedOutput: 'Fix typo in README',
        explanation: "Three separate commits for what should be one logical change. This makes history hard to read."
      },
      {
        instruction: "Let's use interactive rebase to clean this up. Start with the last 3 commits.",
        command: 'git rebase -i HEAD~3',
        expectedOutput: 'Interactive rebase started',
        explanation: "git rebase -i lets you edit commit history. HEAD~3 means 'the last 3 commits'."
      },
      {
        instruction: "In the real editor, you'd squash commits. Let's simulate squashing the last 2 into the first.",
        command: 'git reset --soft HEAD~2',
        expectedOutput: 'Reset to HEAD~2',
        explanation: "git reset --soft keeps your changes but moves the branch pointer back 2 commits."
      },
      {
        instruction: "Now create one clean commit from all the changes.",
        command: 'git commit -m "Initial project setup with README and package.json"',
        expectedOutput: 'Initial project setup with README and package.json',
        explanation: "Much better! One descriptive commit instead of three messy ones."
      },
      {
        instruction: "Let's check our cleaned history.",
        command: 'git log',
        expectedOutput: 'Initial project setup',
        explanation: "Perfect! Clean, readable history that tells the story clearly."
      },
      {
        instruction: "Now let's learn about amending. Make a new commit with a mistake.",
        command: 'git add src/app.js',
        expectedOutput: 'Changes staged for commit',
        explanation: "Sometimes you realize you made a mistake in the last commit message or forgot something."
      },
      {
        instruction: "Commit with a typo in the message (oops!).",
        command: 'git commit -m "Add main aplication file"',
        expectedOutput: 'Add main aplication file',
        explanation: "Notice the typo: 'aplication' instead of 'application'. We can fix this!"
      },
      {
        instruction: "Add a forgotten file that should be part of this commit.",
        command: 'git add src/config.js',
        expectedOutput: 'Changes staged for commit',
        explanation: "You realized you forgot to include the config file in the last commit."
      },
      {
        instruction: "Use amend to fix the last commit (add the file and fix the message).",
        command: 'git commit --amend -m "Add main application file and configuration"',
        expectedOutput: 'Add main application file and configuration',
        explanation: "git commit --amend modifies the last commit. It adds staged changes and can update the message."
      },
      {
        instruction: "Check our history - the last commit should be fixed.",
        command: 'git log',
        expectedOutput: 'Add main application file and configuration',
        explanation: "Perfect! The typo is fixed and the forgotten file is included. The commit ID changed!"
      },
      {
        instruction: "Let's practice rebasing onto another branch. First, create a feature branch.",
        command: 'git checkout -b feature-login',
        expectedOutput: 'Switched to a new branch \'feature-login\'',
        explanation: "We'll develop a feature and then rebase it onto an updated main branch."
      },
      {
        instruction: "Add feature code.",
        command: 'git add src/login.js',
        expectedOutput: 'Changes staged for commit',
        explanation: "Working on the login feature."
      },
      {
        instruction: "Commit the feature.",
        command: 'git commit -m "Add login functionality"',
        expectedOutput: 'Add login functionality',
        explanation: "Feature work is done on the feature branch."
      },
      {
        instruction: "Switch back to main to simulate team updates.",
        command: 'git checkout main',
        expectedOutput: 'Switched to branch \'main\'',
        explanation: "Meanwhile, your team has made progress on main..."
      },
      {
        instruction: "Add a team update to main.",
        command: 'git add src/database.js',
        expectedOutput: 'Changes staged for commit',
        explanation: "Your teammate added database functionality."
      },
      {
        instruction: "Commit the team's work.",
        command: 'git commit -m "Add database connection"',
        expectedOutput: 'Add database connection',
        explanation: "Now main has moved forward while you were working on your feature."
      },
      {
        instruction: "Switch back to your feature branch.",
        command: 'git checkout feature-login',
        expectedOutput: 'Switched to branch \'feature-login\'',
        explanation: "Time to integrate your feature with the updated main branch."
      },
      {
        instruction: "Rebase your feature onto the updated main.",
        command: 'git rebase main',
        expectedOutput: 'Rebasing feature-login onto main',
        explanation: "git rebase replays your feature commits on top of the latest main. This creates linear history!"
      },
      {
        instruction: "Check the clean, linear history.",
        command: 'git log',
        expectedOutput: 'Add login functionality',
        explanation: "Excellent! Your feature commits now appear after the latest main commits. Clean, linear history!"
      }
    ],
    initialState: {
      initialized: false,
      currentBranch: 'main',
      branches: ['main'],
      commits: [],
      stagedChanges: [],
      remotes: {},
      stash: [],
      untrackedFiles: []
    }
  }
};

export default tutorials;