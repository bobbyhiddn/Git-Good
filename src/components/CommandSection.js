// src/components/CommandSection.js
import React from 'react';
import GitCommandSimulator from './GitCommandSimulator';

const CommandSection = ({ title, command, description, initialCommand }) => (
  <section>
    <h2>{title}</h2>
    <p>{description}</p>
    <pre>
      <code>{command}</code>
    </pre>
    <p className="section-instruction">
      Try running the command below in the terminal.
    </p>
    <GitCommandSimulator initialCommand={initialCommand} />
  </section>
);

export default CommandSection;
