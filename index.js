/*jslint node: true, nomen: true, white: true */
module.exports = function (app) {
	'use strict';

	var logger = app.logger && app.logger.child({component: 'Database'}),
		couchbase = require('couchbase'),
        cluster = new couchbase.Cluster('couchbase://' + app.config.get('couchbase:url')),
        bucket = cluster.openBucket(app.config.get('couchbase:bucket'), function (err) {
            if (err) {
                if (logger) {
                    app.logger.fatal('Erreur lors de la connection à la base de données %s', app.config.get('db:url'));
                }
                return new Error({code: 'DATABASE_CONNECT_FAIL'});
            } else {
                app.logger.info('Connecté à la base de données %s', app.config.get('db:url'));
            }
        });
    return bucket;
};