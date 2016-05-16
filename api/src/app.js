'use strict';

const app = require('koa')();
const cors = require('koa-cors');
const route = require('koa-route');
const paginate = require('koa-paginate');
const mongodb = require('mongodb');

// Mongo Setup
// MongoURL link is provided by docker-compose
const mongoURL = 'mongodb://mongodb/NIGradJobs';
const MongoClient = mongodb.MongoClient;

// CORS
app.use(cors(false));

// Set up pagination
app.use(paginate.middleware({
  defaultLimit: 10,
  maxLimit: 50,
}));

const jobs = {
  get: function *() {
    // Wraps data and adds nextHref
    this.paginate = true;

    // Get limit and offset
    const limit = this.pagination.limit;
    const offset = this.pagination.offset;

    // Connect to database and choose collection
    const db = yield MongoClient.connect(mongoURL);
    const collection = db.collection('jobs');

    // Get data
    const data = yield collection.find().skip(offset).limit(limit).toArray();

    // Close DB connection
    db.close();

    // Set response
    this.body = data;
  },
  getSpecific: function *(id) {
    // Connect to database and choose collection
    const db = yield MongoClient.connect(mongoURL);
    const collection = db.collection('jobs');

    // Get data
    const data = yield collection.find({ id : id }).toArray();
    console.log(data);

    // Close DB connection
    db.close();

    // Set response
    this.body = data;
  }
}

// Set up the API
app.use(route.get('/api/jobs', jobs.get));
app.use(route.get('/api/jobs/:id', jobs.getSpecific));

// Listen on port 3000
app.listen(3000);
