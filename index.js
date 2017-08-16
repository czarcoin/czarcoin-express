const assert = require('assert');
const express = require('express');
const errors = require('storj-service-error-types');

const app = express();

const server = (config) => {
  const storj = new Environment({
    bridgeUrl: config.bridgeUrl,
    bridgeUser: config.bridgeUser,
    bridgePass: config.bridgePass,
    encryptionKey: config.encryptionKey,
    logLevel: config.logLevel
  });

  const server = express();

  server.get('/', (req, res, next) => {
    storj.getInfo((err, result) => {
      if (err) res.status(500).send(errors.InternalError());
      res.status(200).send(result);
      // destroy here?
    });
  });

  return server;
}

exports.Storj = server;
