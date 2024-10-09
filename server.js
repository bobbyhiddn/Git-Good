const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Read the GitCommandSimulator component file
const GitCommandSimulatorCode = fs.readFileSync(path.join(__dirname, 'GitCommandSimulator.js'), 'utf8');

app.get('/', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Git Command Simulator</title>
        <script src="https://unpkg.com/react@17/umd/react.development.js"></script>
        <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      </head>
      <body>
        <div id="root">If you see this, React hasn't rendered anything yet.</div>
        <script>
          ${GitCommandSimulatorCode}
          ReactDOM.render(React.createElement(GitCommandSimulator), document.getElementById('root'));
        </script>
      </body>
    </html>
  `;
  res.send(html);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});