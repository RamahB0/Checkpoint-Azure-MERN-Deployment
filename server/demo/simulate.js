// demo/simulate.js
//
// Verification script for the MERN app used in the "Checkpoint:
// Hosting a MERN App on Microsoft Azure" checkpoint.
//
// This environment has no route to a real MongoDB server - there is no
// way to install/download `mongod` here (outbound access to MongoDB's
// download host is blocked by the sandbox's network policy), so a real
// MongoDB Atlas connection (as the checkpoint instructs for production)
// can't be exercised from inside this script. To still verify the app
// behaves correctly, this drives the *real* Express app and route code
// (app.js, routes/tasks.js) through real HTTP requests via supertest,
// with only the persistence layer swapped for an in-memory stand-in
// (demo/fakeTaskModel.js). Production (server.js) always uses the real
// Mongoose model against MongoDB Atlas, exactly as the checkpoint
// describes - nothing about the production code path is faked.

const request = require('supertest');
const { createApp } = require('../app');
const { createFakeTaskModel } = require('./fakeTaskModel');

function section(title) {
  console.log('\n=== ' + title + ' ===');
}

async function main() {
  const fakeTaskModel = createFakeTaskModel();
  const app = createApp(fakeTaskModel);

  section('Health check (GET /api/health)');
  let res = await request(app).get('/api/health');
  console.log(`GET /api/health -> ${res.status} ${JSON.stringify(res.body)}`);

  section('Initial task list (should be empty)');
  res = await request(app).get('/api/tasks');
  console.log(`GET /api/tasks -> ${res.status} ${JSON.stringify(res.body)}`);

  section('Reject a task with no title (validation)');
  res = await request(app).post('/api/tasks').send({});
  console.log(`POST /api/tasks {} -> ${res.status} ${JSON.stringify(res.body)}`);

  section('Create three tasks');
  const titles = [
    'Set up Azure Web App',
    'Connect MongoDB Atlas',
    'Deploy via GitHub continuous integration',
  ];
  const created = [];
  for (const title of titles) {
    res = await request(app).post('/api/tasks').send({ title });
    console.log(`POST /api/tasks {title:"${title}"} -> ${res.status} ${JSON.stringify(res.body)}`);
    created.push(res.body);
  }

  section('List tasks after creation');
  res = await request(app).get('/api/tasks');
  console.log(`GET /api/tasks -> ${res.status} (${res.body.length} tasks)`);
  res.body.forEach((t) => console.log(`  - [${t.done ? 'x' : ' '}] ${t.title} (${t._id})`));

  section('Mark the first task as done');
  const firstId = created[0]._id;
  res = await request(app).put(`/api/tasks/${firstId}`).send({ done: true });
  console.log(`PUT /api/tasks/${firstId} {done:true} -> ${res.status} ${JSON.stringify(res.body)}`);

  section('Delete the second task');
  const secondId = created[1]._id;
  res = await request(app).delete(`/api/tasks/${secondId}`);
  console.log(`DELETE /api/tasks/${secondId} -> ${res.status} ${JSON.stringify(res.body)}`);

  section('Update a task that no longer exists (404 case)');
  res = await request(app).put(`/api/tasks/${secondId}`).send({ done: true });
  console.log(`PUT /api/tasks/${secondId} -> ${res.status} ${JSON.stringify(res.body)}`);

  section('Final task list');
  res = await request(app).get('/api/tasks');
  console.log(`GET /api/tasks -> ${res.status} (${res.body.length} tasks)`);
  res.body.forEach((t) => console.log(`  - [${t.done ? 'x' : ' '}] ${t.title} (${t._id})`));

  section('Non-API route falls back to the SPA (catch-all route)');
  res = await request(app).get('/some/client/side/route');
  console.log(`GET /some/client/side/route -> ${res.status}`);
  console.log(res.text.slice(0, 160));

  section('Done');
  console.log('In production, server.js connects this same app.js to MongoDB Atlas via MONGODB_URI and is deployed on Azure App Service (see README.md).');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
