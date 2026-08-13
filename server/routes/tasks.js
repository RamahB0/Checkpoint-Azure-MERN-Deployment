// routes/tasks.js
//
// REST API for tasks: GET (list), POST (create), PUT (update/toggle),
// DELETE (remove). Exported as a factory that takes the Task model to
// use, so the exact same route logic can run against the real Mongoose
// model (production, connected to MongoDB Atlas on Azure) or an
// in-memory stand-in (this environment's demo/verification script,
// which has no route to a real MongoDB instance - see demo/simulate.js
// for why).

const express = require('express');

function tasksRouter(Task) {
  const router = express.Router();

  // GET /api/tasks - list all tasks
  router.get('/', async (req, res) => {
    const tasks = await Task.find().sort({ createdAt: 1 });
    res.json(tasks);
  });

  // POST /api/tasks - create a task
  router.post('/', async (req, res) => {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'title is required' });
    }
    const task = await Task.create({ title: title.trim() });
    res.status(201).json(task);
  });

  // PUT /api/tasks/:id - update a task (e.g. toggle done)
  router.put('/:id', async (req, res) => {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!task) return res.status(404).json({ error: 'task not found' });
    res.json(task);
  });

  // DELETE /api/tasks/:id - remove a task
  router.delete('/:id', async (req, res) => {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'task not found' });
    res.json({ deleted: true, id: req.params.id });
  });

  return router;
}

module.exports = tasksRouter;
