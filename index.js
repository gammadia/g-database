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
                bucket = cluster.openBucket(bucketName, function (err) {
                    if (err) {
                        if (logger) {
                            app.logger.fatal('Erreur lors de la connection à la base de données %s', host);
                            app.logger.fatal(err);
                        }
                        return new Error({code: 'DATABASE_CONNECT_FAIL'});
                    }
                    app.logger.info('Connecté à la base de données %s', host);
                });
                bucket.connectionTimeout = 10000;
                return bucket;
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