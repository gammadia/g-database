'use strict';

const couchbase = require("couchbase");

module.exports = function (app) {
  'use strict';

  let crypto,
    cluster = null,
    bucket = null;

  try {
    crypto = require('node:crypto');
  } catch (err) {
    console.log('crypto support is disabled!');
    console.log(err)

    return;
  }

  const couchbase = require('couchbase');

  return {
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
     */
    init: async function (host, bucketName, username, password) {
      cluster = await couchbase.connect('couchbase://' + host, {
        username: username,
        password: password
      });

      bucket = cluster.bucket(bucketName);

      return;
    },
    close: function (callback) {
      cluster.close(callback)
    },
    get: function () {
      return bucket;
    },

    /**
     * @return {ViewQuery}
     */
    getViewQuery: function () {
      return new ViewQuery();
    },

    /**
     * @param {string} secret
     * @returns {string}
     */
    getKey: function (secret) {
      const date = (new Date()).valueOf().toString();
      const array = new Uint32Array(10);
      const random = crypto.getRandomValues(array);
      const s = secret || '';
      const {createHmac} = require('node:crypto');

      return createHmac('sha256', s).update(date + random).digest('hex');
    }
  };
};

class ViewQuery {
  constructor() {
    this._designDoc = "";
    this._viewName = ""
    this._options = {range: {start: null, end: null}};

    this.Update = {
      BEFORE: couchbase.ViewScanConsistency.RequestPlus,
      AFTER: couchbase.ViewScanConsistency.UpdateAfter,
      NONE: couchbase.ViewScanConsistency.NotBounded
    }
  }

  from(designDoc, viewName) {
    this._designDoc = designDoc;
    this._viewName = viewName;

    return this;
  }

  key(key) {
    this._options.key = key;

    return this;
  }

  keys(keys) {
    this._options.keys = keys;

    return this;
  }

  stale(stale) {
    this._options.scanConsistency = stale;

    return this;
  }

  limit(limit) {
    this._options.limit = limit;

    return this;
  }

  skip(step) {
    this._options.skip = step;

    return this;
  }

  range(start, end) {
    this._options.range.start = start;
    this._options.range.end = end;

    return this;
  }

  reduce(reduce) {
    this._options.reduce = reduce;

    return this;
  }

  custom(options) {
      if (options.group_level !== undefined) {
        this._options.group_level = options.group_level;
      }

      if (options.startkey !== undefined) {
        this._options.range.start = JSON.parse(options.startkey);
      }

      if (options.endkey !== undefined) {
        this._options.range.end = JSON.parse(options.endkey);
      }

      if (options.descending !== undefined) {
        this._options.order = options.descending ? couchbase.ViewOrdering.Descending : couchbase.ViewOrdering.Ascending;
      }

      if (options.reduce !== undefined) {
        this._options.reduce = options.reduce;
      }

      if (options.key !== undefined) {
        this._options.key = options.key;
      }

      // @deprecated
      if (options.include_docs !== undefined) {
        this._options.include_docs = options.include_docs;
      }

    return this;
  }

  getDesignDoc() {
    return this._designDoc;
  }

  getViewName() {
    return this._viewName;
  }

  getOptions() {
    return this._options;
  }
}

module.exports.ViewQuery = ViewQuery;
