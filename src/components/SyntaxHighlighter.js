import React from 'react';

const SyntaxHighlighter = ({ command, type = 'command' }) => {
  if (type === 'command') {
    return highlightCommand(command);
  } else if (type === 'output') {
    return highlightOutput(command);
  }
  return command;
};

const highlightCommand = (command) => {
  if (!command) return command;

  const parts = command.split(' ');
  return (
    <span>
      {parts.map((part, index) => {
        let className = '';
        
        if (index === 0 && part === 'git') {
          className = 'syntax-git';
        } else if (index === 1) {
          className = 'syntax-subcommand';
        } else if (part.startsWith('-')) {
          className = 'syntax-flag';
        } else if (part.includes('/') || part.includes('.')) {
          className = 'syntax-path';
        } else if (part.startsWith('"') && part.endsWith('"')) {
          className = 'syntax-string';
        } else if (index > 1) {
          className = 'syntax-argument';
        }

        return (
          <span key={index} className={className}>
            {part}
            {index < parts.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </span>
  );
};

const highlightOutput = (output) => {
  if (!output) return output;

  // Split by lines for multi-line output
  const lines = output.split('\n');
  
  return (
    <span>
      {lines.map((line, lineIndex) => (
        <span key={lineIndex}>
          {highlightOutputLine(line)}
          {lineIndex < lines.length - 1 && <br />}
        </span>
      ))}
    </span>
  );
};

const highlightOutputLine = (line) => {
  // Branch listings
  if (line.startsWith('* ')) {
    return <span className="syntax-current-branch">{line}</span>;
  }
  if (line.startsWith('  ') && line.trim().length > 0) {
    return <span className="syntax-branch">{line}</span>;
  }
  
  // Status output
  if (line.startsWith('On branch ')) {
    return (
      <span>
        On branch <span className="syntax-current-branch">{line.replace('On branch ', '')}</span>
      </span>
    );
  }
  
  // Success messages
  if (line.includes('Switched to') || line.includes('Created branch') || line.includes('Deleted branch')) {
    return <span className="syntax-success">{line}</span>;
  }
  
  // Error messages
  if (line.startsWith('Error:') || line.startsWith('error:') || line.startsWith('fatal:')) {
    return <span className="syntax-error">{line}</span>;
  }
  
  // Commit hashes
  const commitHashRegex = /\b[a-f0-9]{7,40}\b/g;
  if (commitHashRegex.test(line)) {
    return (
      <span>
        {line.replace(commitHashRegex, (match) => 
          `<span class="syntax-hash">${match}</span>`
        )}
      </span>
    );
  }
  
  return line;
};

export default SyntaxHighlighter;