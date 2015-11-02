/*jslint node: true, nomen: true, white: true */
module.exports = function (app) {
	'use strict';

	var logger = app.logger && app.logger.child({component: 'Database'}),
		nano = require('nano'),
		Agentkeepalive = require('agentkeepalive'),
	    agent = new Agentkeepalive({
            maxSockets: app.config.get('db:sockets') || 32,
            maxKeepAliveRequests: 0,
            maxKeepAliveTime: 30000
        }),
        db;

    db = nano({
            url:	app.config.get('db:url'),
            log:	function (event) {
                if (!logger) {
                    return;
                }
                if (event.method) {
                    logger.debug('%s - %s', event.method, event.uri);
                }

                if (event.err === null) {
                    logger.debug('[%s] - %s', event.headers.statusCode, event.headers.uri);
                }
            },
            request_defaults: {
                agent: agent
            }
        });

	if (db instanceof Error) {
		if (logger) {
			app.logger.fatal('Erreur lors de la connection à la base de données %s', app.config.get('db:url'));
		}
		return new Error({code: 'DATABASE_CONNECT_FAIL'});
	}

	if (logger) {
		app.logger.info('Connecté à la base de données %s', app.config.get('db:url'));
	}

    return db;
};
