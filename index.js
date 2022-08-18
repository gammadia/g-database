/*jslint node: true, nomen: true, white: true */
const couchbase = require("couchbase");
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

                function connect() {
                  return new Promise((resolve, reject) => {
                    let b = cluster.openBucket(bucketName, function (err) {
                      if (err) {
                        return reject(err)
                      }

                      resolve(b)
                    });
                  });
                }

                let retry = 0;
                function establishConnection() {
                  if (retry > 10) {
                    app.logger.error("Unable to connect to the database")

                    return
                  }
                  const c = connect();
                  c.then(b => {
                    app.logger.info("Connected to the database")

                    bucket = b
                  }).catch(err => {
                    app.logger.error(err)

                    retry++;
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