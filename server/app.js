// app.js
//
// Builds the Express app (kept separate from server.js/listen() so the
// demo/verification script can exercise the exact same app in-process,
// optionally with a different Task model - see demo/simulate.js).
//
// Follows the three Azure-readiness points from the checkpoint tutorial:
//   1. Dynamic port -> handled in server.js via process.env.PORT.
//   2. Serve the React production build as static files.
//   3. A catch-all GET route that returns the build's index.html so
//      client-side routing works after a full page refresh on Azure.

const path = require('path');
const express = require('express');
const cors = require('cors');
const tasksRouter = require('./routes/tasks');
const TaskModel = require('./models/Task');

function createApp(Task = TaskModel) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // --- API routes ---------------------------------------------------
  app.use('/api/tasks', tasksRouter(Task));
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  // --- Serve the React production build (Azure production step 2/3) -
  const clientBuildPath = path.join(__dirname, '..', 'client', 'build');
  app.use(express.static(clientBuildPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(clientBuildPath, 'index.html'), (err) => {
      // In local dev the client hasn't necessarily been built, so fall
      // back to a small message instead of crashing the demo.
      if (err) {
        res
          .status(200)
          .send(
            'MERN backend is running. Run "npm run build" in /client to serve the React app from here.'
          );
      }
    });
  });

  return app;
}

module.exports = { createApp };
