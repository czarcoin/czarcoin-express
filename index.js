const assert = require('assert');
const path = require('path');
const express = require('express');
const errors = require('storj-service-error-types');
const middleware = require('storj-service-middleware');
const busboy = require('connect-busboy');
const fs = require('fs-extra');
const os = require('os');
const { Environment } = require('storj');
const app = express();
const rawbody = middleware.rawbody;
const multer = require('multer');

const server = (config) => {
  const storj = new Environment({
    bridgeUrl: config.bridgeUrl,
    bridgeUser: config.bridgeUser,
    bridgePass: config.bridgePass,
    encryptionKey: config.encryptionKey,
    logLevel: config.logLevel
  });

  const server = express();
  const handleError = (err, req, res) => res.status(500).send(err);

  /*
   * BASIC REQUESTS
   */
  server.get('/', (req, res) => {
    storj.getInfo((err, result) => {
      if (err) handleError(err, req, res);
      return res.status(200).send(result);
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

      return res.status(200).send(result);
    });
  });

  server.post('/buckets', rawbody, (req, res) => {
    storj.createBucket(req.body.bucketName, (err, result) => {
      if (err) {
        return res.status(500).send(errors.InternalError());
      }

      return res.status(201).send(result);
    });
  });

  server.delete('/buckets/:id', (req, res) => {
    console.log('req.params', req.params);
    storj.deleteBucket(req.params.id, (err, result) => {
      if (err) {
        res.status(500).send(errors.InternalError());
      }

      return res.status(203).send(result);
    });
  });

  /*
   * FILES
   */
  server.get('/buckets/:id', (req, res) => {
    storj.listFiles(req.params.id, (err, result) => {
      if (err) handleError(err, req, res);

      return res.status(200).send(result);
    });
  });

  const upload = multer({ dest: 'uploads/' });

  server.post('/buckets/:id', upload.single('file'), (req, res, next) => {

    console.log('req.files: ', req.files);
    console.log('req.file: ', req.file);

    res.status(200).send('OK');
  });

  return server;
}

module.exports = server;
