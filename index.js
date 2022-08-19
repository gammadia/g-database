/*jslint node: true, nomen: true, white: true */
const couchbase = require("couchbase");
module.exports = function (app) {
  'use strict';

  let logger = app.logger && app.logger.child({component: 'Database'}),
    couchbase = require('couchbase'),
    crypto = require('crypto-js'),
    cluster = null,
    bucket = null,
    retry = 0;

  return {
    init: function (host, bucketName, username, password) {
      if (retry > 10) {
        logger.error("Unable to connect to the database.")
        return;
      }

      cluster = new couchbase.Cluster('couchbase://' + host);
      cluster.authenticate(username, password);
      bucket = cluster.openBucket(bucketName, function (err) {
        if (err) {
          retry++;
          setTimeout(() => {
            this.init(host, bucketName, username, password)
          }, 2000);
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