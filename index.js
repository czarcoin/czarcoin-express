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
const url = require('url');

const server = (config) => {
  const storj = new Environment({
    bridgeUrl: config.bridgeUrl,
    bridgeUser: config.bridgeUser,
    bridgePass: config.bridgePass,
    encryptionKey: config.encryptionKey,
    logLevel: config.logLevel
  });

	const destination = config.destination || 'uploads/';
  const server = express();
  const handleError = (err, req, res) => res.status(500).send(err);
	const storage = multer.diskStorage({
		destination: function(req, file, callback) {
			callback(null, destination)
		},
		filename: function(req, file, callback) {
			callback(null, req.body.fileTitle || fileTitle)
		}
	});

  // form-data key must match the value passed to `single()`
	const upload = multer({ storage: storage }).single('file');
	const fileTitle = 'storj-file-' + Date.now() + '.jpg';
	const uploadFilePath = './uploads/' + fileTitle;
	const downloadFilePath = config.downloadPath || './downloads'

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

  server.post('/buckets/:id', (req, res, next) => {
				// accepts a single file
		let bucketId = req.params.id;

		function uploadFile() {
			let uploadFilePromise = new Promise((resolve, reject) => {
				upload(req, res, function(err) {
					if (err) {
						console.log('multer error uploading file', err);
						return reject(err);
					} else {
						resolve(req);
						console.log('file successfully uploaded to local server!');
					}
				});
			});
			return uploadFilePromise;
		}

		function sendToBridge() {
      const extension = req.file.mimetype.split('/')
      console.log('extension: ', extension[1])
      const formattedFilename = `${req.body.filename || fileTitle}.${extension[1]}`
			storj.storeFile(bucketId, uploadFilePath, {
				filename: formattedFilename,
				progressCallback: (progress, uploadedBytes, totalBytes) => {
					console.log('Progress: %d, UploadedBytes: %d, TotalBytes: %d',
            progress, uploadedBytes, totalBytes);
				},
				finishedCallback: (err, fileId) => {
					if (err) {
						console.log(err);
						return next(err);
					}
					console.log('File upload complete:', fileId);
					return res.status(201).send({
						file_id: fileId,
						message: 'success'
					});
				}
			});
		}

		uploadFile()
			.then(sendToBridge)
			.catch((err) => {
				return next(err);
			});
  });

	server.get('/buckets/:bucketId/files/:fileId', (req, res) => {
		const filePath = `${downloadFilePath}/${req.params.fileId}`
		console.log('downloading to ', filePath);
		storj.resolveFile(req.params.bucketId, req.params.filedId, downloadFilePath, {
			progressCallback: function (progress, downloadedBytes, totalBytes) {
				console.log('progress: ', progress);
			},
			finishedCallback: function (err) {
				if (err) console.error('Error downloading file: ', err);
				return res.status(200).send('file downloaded')
			},
			overwrite: true
		});
	});

  server.delete('/buckets/:bucketId/files/:fileId', (req, res) => {
    storj.deleteFile(req.params.bucketId, req.params.fileId, (err, result) => {
      if (err) {
        console.log(`error deleting file ${req.params.fileId}: ${err}`);
      }

      console.log('RESULT: ', result);
    });
  });

  return server;
}

module.exports = server;
