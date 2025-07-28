import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import TutorialTerminal from '../components/TutorialTerminal';
import { GitProvider } from '../context/GitContext';
import { tutorials } from '../data/tutorials';

const TutorialPage = () => {
  const { tutorialId } = useParams();
  const tutorial = tutorials[tutorialId];

  if (!tutorial) {
    return <Navigate to="/tutorials" replace />;
  }

  return (
    <GitProvider>
      <TutorialTerminal tutorial={tutorial} />
    </GitProvider>
  );
};

export default TutorialPage;