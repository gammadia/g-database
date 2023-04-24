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
     * @returns {Promise}
     */
    init: function (host, bucketName, username, password) {
      cluster = new couchbase.Cluster('couchbase://' + host, {
        username: username,
        password: password
      });

      return new Promise((resolve, reject) => {
        let b = cluster.bucket(bucketName, function (err) {
          if (err) {
            reject(err);
          } else {
            bucket = b;
            resolve(bucket);
          }
        });
      });
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
    /**
     * @param {string} secret
     * @returns {string}
     */
    getKey: function (secret) {
      const date = (new Date()).valueOf().toString(),
        random = Math.random().toString(),
        s = secret || '';

      return crypto.HmacSHA256(date + random, s).toString(crypto.enc.Hex);
    }
  };
};