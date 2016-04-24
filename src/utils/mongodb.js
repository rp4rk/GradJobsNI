const mongodb = require('mongodb');

// Mongo Setup
// MongoURL link is provided by docker-compose
const mongoURL = 'mongodb';
const MongoClient = mongodb.MongoClient;

module.exports = new Promise((resolve, reject) => {
  MongoClient.connect(mongoURL, (err, db) => {
    if (err) { reject(err); }
    resolve(db);
  });
});
