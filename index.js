/*jslint node: true, nomen: true, white: true */
module.exports = function (app) {
	'use strict';

  var logger      = app.logger && app.logger.child({component: 'Database'}),
    couchbase   = require('couchbase'),
        crypto      = require('crypto-js'),
        cluster     = null,
        bucket      = null,
        database    = {
            init: function (host, bucketName, username, password) {
                cluster = new couchbase.Cluster('couchbase://' + host);
                cluster.authenticate(username, password);

                function connect(cluster, bucketName) {
                  return new Promise((resolve, reject) => {
                    bucket = cluster.openBucket(bucketName, function (err) {
                      if (err) {
                        reject(err)
                      }
                    });

                    resolve(bucket)
                  });
                }

                function establishConnection() {
                  var c = connect(cluster, bucketName);
                  c.then(bucket => app.logger.info("Connected to the database"))
                    .catch(err => {
                      app.logger.error(err)

                      setTimeout(establishConnection, 2000)
                    });
                }

                establishConnection();
            },
            get: function () {
                return bucket;
            },
            getViewQuery: function () {
                return couchbase.ViewQuery;
            },
            getN1qlQuery: function () {
                return couchbase.N1qlQuery;
            },
            getSpatialQuery: function () {
                return couchbase.SpatialQuery;
            },
            getKey: function (secret) {
                var date = (new Date()).valueOf().toString(),
                    random = Math.random().toString(),
                    secret = secret || '';

                return crypto.HmacSHA256(date + random, secret).toString(crypto.enc.Hex);
            }
        };
    return database;
};