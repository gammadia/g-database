/*jslint node: true, nomen: true, white: true */
module.exports = function (app) {
	'use strict';

	var logger = app.logger && app.logger.child({component: 'Database'}),
		nano = require('nano'),
		db = null,
		Agentkeepalive = require('agentkeepalive'),
		agent = null;

	agent = new Agentkeepalive({
		maxSockets: app.config.get('db:sockets') || 32,
		maxKeepAliveRequests: 0,
		maxKeepAliveTime: 30000
	});

	db = nano({
		url:	app.config.get('db:url'),
		log:	function (id, args) {
			if (!logger) {
				return;
			}

			if (args && args.method) {
				logger.debug('%s - %s', args.method, args.uri);
			}

			if (args && args.err === null && args.body._id) {
				logger.debug('[%s] - %s', args.headers.statusCode, args.body._id);
			}

            if (args && args.err && args.err !== null) {
                logger.error('[%s] - %s', args.headers.statusCode, args.err);
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