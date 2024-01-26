'use strict';

const {ViewScanConsistency, ViewOrdering} = require("couchbase/dist/viewtypes");
const couchbase = require("couchbase");
module.exports = function (app) {
  'use strict';

  const couchbase = require('couchbase');

  let crypto = require('crypto-js'),
    cluster = null,
    bucket = null;

  return {
    ViewScanConsistency: {
      Update: {
        BEFORE: couchbase.ViewScanConsistency.RequestPlus,
        AFTER: couchbase.ViewScanConsistency.UpdateAfter,
        NONE: couchbase.ViewScanConsistency.NotBounded
      }
    },
    ViewOrdering: {
      Ascending: couchbase.ViewOrdering.Ascending,
      Descending: couchbase.ViewOrdering.Descending
    },

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
    init: async function (host, bucketName, username, password) {
      cluster = await couchbase.connect('couchbase://' + host, {
        username: username,
        password: password
      });

      bucket = cluster.bucket(bucketName);

      return
    },
    close: function (callback) {
      cluster.close(callback)
    },
    get: function () {
      return bucket;
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
