'use strict';

const Bucket = require("couchbase/lib/bucket")

module.exports = function (app) {
  'use strict';

  let logger = app.logger && app.logger.child({component: 'Database'}),
    couchbase = require('couchbase'),
    crypto = require('crypto-js'),
    cluster = null,
    bucket = null;

  return {
    /**
     * Initialize the connection to the database.
     *
     * @param {string} host
     * @param {string} bucketName
     * @param {string} username
     * @param {string} password
     *
     * @returns {Bucket}
     */
    init: function (host, bucketName, username, password) {
      cluster = new couchbase.Cluster('couchbase://' + host);
      cluster.authenticate(username, password);

      bucket = cluster.openBucket(bucketName, function (err) {
        if (err) {
          logger.error(err)
        }
      });
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