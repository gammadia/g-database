/*jslint node: true, nomen: true, white: true */
module.exports = function (app) {
  'use strict';

  let logger = app.logger && app.logger.child({component: 'Database'}),
    couchbase = require('couchbase'),
    crypto = require('crypto-js'),
    cluster = null,
    bucket = null;

  return {
    init: function (host, bucketName, username, password) {
      cluster = new couchbase.Cluster('couchbase://' + host);
      cluster.authenticate(username, password);

      let retry = 0;
      function connect() {
        if (retry > 10) {
          logger.error("Unable to connect to the database.")
          return;
        }

        return cluster.openBucket(bucketName, function (err) {
          if (err) {
            logger.error(err)
            retry++;
            setTimeout(connect, 2000);
          }
        });
      }

      bucket = connect()
    },
    get: function () {
      return cluster;
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
};