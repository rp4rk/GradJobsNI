const mongodb = require('mongodb');

// Mongo Setup
// MongoURL link is provided by docker-compose
const mongoURL = 'mongodb://mongodb/NIGradJobs';
const MongoClient = mongodb.MongoClient;

// Export connection manager
module.exports = class MongoDB {
  // Return a promise to connect
  connect() {
    return new Promise((resolve, reject) => {
      MongoClient.connect(mongoURL, (err, db) => {
        if (err) { reject(err); }
        resolve(db);
      });
    });
  }


  // Insert an array of objects
  bulkInsert(documents, collection) {
    if (documents.length > 0) {
      this.connect().then((db) => {
        const activeCollection = db.collection(collection);
        activeCollection.insertMany(documents, (err) => {
          if (err) { console.log(err); }
          db.close();
        });
      });
    }
  }

  // Check if jobs exist
  removeDupes(documents, collection) {
    return this.connect().then((db) => {
      const activeCollection = db.collection(collection);

      // Filter through db and removing existing jobs from array
      const jobs = documents.map((document) =>
        new Promise((resolve) => {
          activeCollection.findOne({ id: document.id })
            .then((doc) => {
              if (doc) {
                resolve(null);
              } else {
                resolve(document);
              }
            });
        })
      );

      // Return a promise
      return new Promise((resolve) => {
        Promise.all(jobs)
          .then((values) => {
            const prunedValues = values.filter((v) => v); // Removes NULLs
            db.close();
            resolve(prunedValues);
          });
      });
    });
  }
};
