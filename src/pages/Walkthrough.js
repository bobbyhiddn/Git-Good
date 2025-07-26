import React from 'react';
import CommandSection from '../components/CommandSection';
import { GitProvider } from '../context/GitContext';

const Walkthrough = () => {
  return (
    <GitProvider>
      <div className="app-container">
        <h1>Git Commands 101: A Comprehensive Guide</h1>
        <p>
          Git is a distributed version control system widely used for tracking changes in source code during software development. This guide introduces basic Git operations, configurations for SSL verification, and password caching, as well as branch management and other essential commands.
        </p>

        {/* Configuring Git Settings */}
        <h2>Configuring Git Settings</h2>
        <CommandSection
          title="Set SSL Verify to False"
          command="git config --global http.sslVerify false"
          description="To disable SSL certificate verification for HTTP connections."
          initialCommand="git config --global http.sslVerify false"
        />
        <CommandSection
          title="Set Password Caching"
          command='git config --global credential.helper "cache --timeout=8000"'
          description="To cache your password in memory for a specified period (in seconds)."
          initialCommand='git config --global credential.helper "cache --timeout=8000"'
        />

        {/* Basic Git Operations */}
        <h2>Basic Git Operations</h2>
        <CommandSection
          title="Initialize a New Git Repository"
          command="git init"
          description="Initializes a new Git repository."
          initialCommand="git init"
        />
        <CommandSection
          title="Clone a Repository"
          command="git clone <repository-url>"
          description="Clones a repository into a new directory."
          initialCommand="git clone https://github.com/user/repo.git"
        />
        <CommandSection
          title="Add Files to Staging Area"
          command="git add <file>"
          description="Adds files to the staging area."
          initialCommand="git add README.md"
        />
        <CommandSection
          title="Commit Changes"
          command='git commit -m "Commit message"'
          description="Commits staged changes with a message."
          initialCommand='git commit -m "Initial commit"'
        />
        <CommandSection
          title="Push Changes to Remote Repository"
          command="git push origin <branch-name>"
          description="Pushes local commits to the remote repository."
          initialCommand="git push origin main"
        />
        <CommandSection
          title="Pull Changes from Remote Repository"
          command="git pull origin <branch-name>"
          description="Pulls updates from the remote repository."
          initialCommand="git pull origin main"
        />
        <CommandSection
          title="Check Status"
          command="git status"
          description="Displays the status of the working directory and staging area."
          initialCommand="git status"
        />
        <CommandSection
          title="View Commit History"
          command="git log"
          description="Shows the commit history."
          initialCommand="git log"
        />

        {/* Branch Management */}
        <h2>Branch Management</h2>
        <CommandSection
          title="Create a New Branch"
          command="git branch <branch-name>"
          description="Creates a new branch but does not switch to it."
          initialCommand="git branch feature-branch"
        />
        <CommandSection
          title="Switch to a Branch"
          command="git checkout <branch-name>"
          description="Switches to the specified branch."
          initialCommand="git checkout feature-branch"
        />
        <CommandSection
          title="Create and Switch to a New Branch"
          command="git checkout -b <branch-name>"
          description="Creates a new branch and immediately switches to it."
          initialCommand="git checkout -b new-feature"
        />
        <CommandSection
          title="List All Branches"
          command="git branch"
          description="Lists all local branches."
          initialCommand="git branch"
        />
        <CommandSection
          title="Merge a Branch"
          command="git merge <branch-name>"
          description="Merges the specified branch into the current branch."
          initialCommand="git merge feature-branch"
        />
        <CommandSection
          title="Delete a Local Branch"
          command="git branch -d <branch-name>"
          description="Deletes a local branch."
          initialCommand="git branch -d feature-branch"
        />
        <CommandSection
          title="Delete a Remote Branch"
          command="git push origin --delete <branch-name>"
          description="Deletes a remote branch."
          initialCommand="git push origin --delete feature-branch"
        />

        {/* Advanced Configurations and Tips */}
        <h2>Advanced Configurations and Tips</h2>
        <CommandSection
          title="Changing a Remote's URL"
          command="git remote set-url origin <new-repository-url>"
          description="Changes the URL of a remote repository."
          initialCommand="git remote set-url origin https://github.com/user/new-repo.git"
        />
        <CommandSection
          title="Stashing Changes"
          command="git stash"
          description="Stashes changes in a dirty working directory."
          initialCommand="git stash"
        />
        <CommandSection
          title="Applying Stashed Changes"
          command="git stash apply"
          description="Applies stashed changes."
          initialCommand="git stash apply"
        />
        <CommandSection
          title="Rebasing"
          command="git rebase <base-branch>"
          description="Reapplies commits on top of another base tip."
          initialCommand="git rebase main"
        />
        <CommandSection
          title="Viewing Changes"
          command="git diff"
          description="Shows changes between commits, commit and working tree, etc."
          initialCommand="git diff"
        />
        <CommandSection
          title="Undoing Changes"
          command="git checkout -- <file>"
          description="Reverts changes to a file in the working directory."
          initialCommand="git checkout -- README.md"
        />

        {/* Creating an All Remote */}
        <h2>Creating an All Remote</h2>
        <p>
          To configure multiple URLs for a single remote in your <code>.git/config</code> file:
        </p>
        <pre>
          <code>
{`[remote "all"]
    url = https://github.com/user/repo1.git
    url = https://github.com/user/repo2.git`}
          </code>
        </pre>
        <p>
          <em>Note:</em> This action involves editing the configuration file directly and cannot be simulated in the terminal.
        </p>

        {/* Conclusion */}
        <p>
          This guide covers essential Git commands for version control, including branch management and merging, which are crucial for collaborative development projects. As you become more familiar with these operations, they will significantly enhance your ability to manage complex codebases and workflows.
        </p>
      </div>
    </GitProvider>
  );
};

export default Walkthrough;