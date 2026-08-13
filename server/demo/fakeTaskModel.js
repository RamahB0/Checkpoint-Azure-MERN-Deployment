// demo/fakeTaskModel.js
//
// A tiny in-memory stand-in for the Mongoose Task model, implementing
// just the handful of static methods routes/tasks.js actually calls
// (find().sort(), create(), findByIdAndUpdate(), findByIdAndDelete()).
//
// Why this exists: this sandbox environment has no route to a real
// MongoDB server (no way to install/download `mongod`, and outbound
// access to MongoDB's own download host is blocked), so there is no
// way to run a *real* MongoDB instance here to verify against. Rather
// than skip verification, this fake lets demo/simulate.js drive the
// exact same Express app and route code (app.js, routes/tasks.js)
// through real HTTP requests (via supertest) - only the persistence
// layer is swapped out. Production (server.js) always uses the real
// Mongoose model (models/Task.js) against MongoDB Atlas, per the
// checkpoint instructions.

let counter = 0;
function nextId() {
  counter += 1;
  return 'demo-' + String(counter).padStart(6, '0');
}

function createFakeTaskModel() {
  const store = new Map(); // id -> task

  function toPublic(task) {
    // Mirror what Mongoose's res.json(doc) would serialize.
    return { ...task };
  }

  return {
    find() {
      // Support the `.sort({ createdAt: 1 })` chaining used in the route.
      return {
        async sort() {
          return Array.from(store.values())
            .sort((a, b) => a.createdAt - b.createdAt)
            .map(toPublic);
        },
      };
    },

    async create({ title }) {
      const now = Date.now();
      const task = {
        _id: nextId(),
        title,
        done: false,
        createdAt: now,
        updatedAt: now,
      };
      store.set(task._id, task);
      return toPublic(task);
    },

    async findByIdAndUpdate(id, updates) {
      const existing = store.get(id);
      if (!existing) return null;
      const updated = { ...existing, ...updates, updatedAt: Date.now() };
      store.set(id, updated);
      return toPublic(updated);
    },

    async findByIdAndDelete(id) {
      const existing = store.get(id);
      if (!existing) return null;
      store.delete(id);
      return toPublic(existing);
    },
  };
}

module.exports = { createFakeTaskModel };
