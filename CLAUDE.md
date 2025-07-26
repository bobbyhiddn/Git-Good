# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### React Development Server
```bash
npm start
```
Starts the React development server on http://localhost:3000

### Express Production Server
```bash
npm run server
```
Runs the Express server that serves the built React app from the build directory

### Build for Production
```bash
npm run build
```
Creates an optimized production build in the `build` directory

### Testing
```bash
npm test
```
Runs the React test suite using react-scripts

## Architecture Overview

### Application Structure
This is a React-based interactive Git learning application with the following key components:

- **Frontend**: React 18 single-page application with simulated terminal interface
- **Backend**: Express.js server for production deployment
- **State Management**: React Context API (GitContext) for simulating Git repository state

### Core Components

**App.js** - Main application component containing educational content and command sections

**GitContext.js** - Centralized state management for simulated Git operations:
- `gitState` tracks: initialized status, current branch, branches list, commits, staged changes, remotes, and stash
- Shared across all GitCommandSimulator instances

**CommandSection.js** - Reusable component that combines:
- Command description and example
- Interactive GitCommandSimulator terminal

**GitCommandSimulator.js** - Terminal simulator that:
- Processes Git commands case-insensitively
- Maintains command history per instance
- Updates shared GitContext state for stateful commands
- Provides realistic Git command responses

### Key Features
- Interactive Git command simulation without actual Git operations
- Persistent state across all terminal instances via React Context
- Educational content covering Git basics through advanced topics
- Responsive terminal interface with command history

## Deployment

### Local Development
Use `npm start` for development with hot reload

### Production Deployment
- **Docker**: Dockerfile builds production-ready container
- **Fly.io**: Configured with fly.toml (port 3000, shared-cpu-1x)
- **Netlify**: Static deployment support

The production server (`npm run server`) serves the built React app and handles client-side routing.