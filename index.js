const assert = require('assert');
const express = require('express');
const errors = require('storj-service-error-types');
const middleware = require('storj-service-middleware');

const { Environment } = require('storj');
const app = express();
const rawbody = middleware.rawbody;

const server = (config) => {
  const storj = new Environment({
    bridgeUrl: config.bridgeUrl,
    bridgeUser: config.bridgeUser,
    bridgePass: config.bridgePass,
    encryptionKey: config.encryptionKey,
    logLevel: config.logLevel
  });

  const server = express();

  /*
   * BASIC REQUESTS
   */
  server.get('/', (req, res) => {
    storj.getInfo((err, result) => {
      if (err) res.status(500).send(errors.InternalError());
      res.status(200).send(result);
      // destroy here?
    });
  });

  /*
   * BUCKETS
   */
  server.get('/buckets', (req, res) => {
    storj.getBuckets((err, result) => {
      if (err) {
        res.status(500).send(errors.InternalError());
      }

      res.status(200).send(result);
    });
  });

  server.post('/buckets', rawbody, (req, res) => {
    storj.createBucket(req.body.bucketName, (err, result) => {
      if (err) {
        return res.status(500).send(errors.InternalError());
      }

      return res.status(201).send({
        message: 'success',
        result
      });
    });
  });

  return server;
}

exports.Storj = server;
