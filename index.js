const assert = require('assert');
const express = require('express');
const errors = require('storj-service-error-types');
const { Environment } = require('storj');
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

  server.get('/', (req, res) => {
    storj.getInfo((err, result) => {
      if (err) res.status(500).send(errors.InternalError());
      res.status(200).send(result);
      // destroy here?
    });
  });

  server.get('/buckets', (req, res) => {
    storj.getBuckets((err, result) => {
      if (err) {
        res.status(500).send(errors.InternalError());
      }

      res.status(200).send(result);
    });
  });

  return server;
}

exports.Storj = server;
