import React, { useContext } from 'react';
import { GitContext } from '../context/GitContext';

const FileSystemVisualizer = ({ untrackedFiles = [] }) => {
  const { gitState } = useContext(GitContext);

  const getFileSystem = () => {
    const baseFileNames = ['README.md', 'package.json'];
    const baseDirNames = ['src/'];

    const committedFileNames = gitState.commits.flatMap(commit => commit.files || []);
    const untrackedFileNames = gitState.untrackedFiles || [];

    const allFileNames = [...new Set([...baseFileNames, ...committedFileNames, ...untrackedFileNames])];

    const files = allFileNames.map(name => {
      let status = 'tracked'; // Default to tracked
      if (untrackedFileNames.includes(name)) {
        status = 'untracked';
      }
      if (gitState.stagedChanges.includes(name)) {
        status = 'staged';
      }
      return { name, status, type: 'file' };
    });

    const directories = baseDirNames.map(name => ({ name, status: 'tracked', type: 'directory' }));

    if (gitState.initialized) {
      directories.unshift({ name: '.git/', status: 'git', type: 'directory' });
    }

    const allEntries = [...directories, ...files];
    return {
      files: allEntries.sort((a, b) => {
        if (a.type === 'directory' && b.type === 'file') return -1;
        if (a.type === 'file' && b.type === 'directory') return 1;
        return a.name.localeCompare(b.name);
      }),
      workingDir: '/project'
    };
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'staged': return '✓';
      case 'modified': return '✎';
      case 'untracked': return '?';
      case 'tracked': return '';
      case 'git': return '';
      default: return '';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'staged': return '#90ee90';
      case 'modified': return '#ffff00';
      case 'untracked': return '#ff8c00';
      case 'tracked': return '#cccccc';
      case 'git': return '#666666';
      default: return '#cccccc';
    }
  };

  const fileSystem = getFileSystem();

  return (
    <div className="file-system-visualizer">
      <div className="file-system-header">
        <h3>📁 Working Directory</h3>
        <div className="current-path">{fileSystem.workingDir}</div>
      </div>
      
      <div className="file-system-legend">
        <div className="legend-item">
          <span className="legend-icon" style={{ color: '#90ee90' }}>✓</span>
          <span>Staged</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon" style={{ color: '#ffff00' }}>✎</span>
          <span>Modified</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon" style={{ color: '#ff8c00' }}>?</span>
          <span>Untracked</span>
        </div>
      </div>

      <div className="file-list">
        {fileSystem.files.map((file, index) => (
          <div key={index} className="file-item">
            <span className="file-icon">
              {file.type === 'directory' ? '📁' : '📄'}
            </span>
            <span 
              className="file-name"
              style={{ color: getStatusColor(file.status) }}
            >
              {file.name}
            </span>
            <span 
              className="file-status"
              style={{ color: getStatusColor(file.status) }}
            >
              {getStatusIcon(file.status)}
            </span>
          </div>
        ))}
      </div>

      <div className="git-status-summary">
        <div className="status-line">
          <strong>Branch:</strong> {gitState.currentBranch}
        </div>
        <div className="status-line">
          <strong>Staged files:</strong> {gitState.stagedChanges.length}
        </div>
        <div className="status-line">
          <strong>Commits:</strong> {gitState.commits.length}
        </div>
      </div>
    </div>
  );
};

export default FileSystemVisualizer;