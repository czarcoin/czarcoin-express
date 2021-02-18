czarcoin-express
=============

add a storj server to an existing express app quickly and easily 

`npm install github:dylanlott/storj-express --save`

```js

const express = require('express');
const app = express(); 

const storj = require('storj-express');

app.use('/storj', storj({
  bridgeUrl: 'https://api.storj.io',
  bridgeUser: <your@storj.email>,
  bridgePass: <your-storj-password>,
  encryptionKey: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
  logLevel: 4
}));

app.listen(1337, () => {
  console.log('storj-enabled express server now running on port 1337');
});

```

you can `app.use()` this route anywhere to namespace a storj service endpoint wherever you want. 

or, alternatively, you can use this to setup a storj microservice by namespacing it to the root url `/`

however you want to use this is up to you! let your imagination run wild. 

## Roadmap 

This is a work in progress middleware package. 

The following routes still need to be implemented 

- [x] .getInfo(function(err, result) {}) - Gets general API info`

- [x] .getBuckets(function(err, result) {}) - Gets list of available buckets

- [x] .createBucket(bucketName, function(err, result) {}) - Creates a bucket

- [x] .deleteBucket(bucketId, function(err, result) {}) - Deletes a bucket

- [x] .listFiles(bucketId, function(err, result) {}) - List files in a bucket

- [x] .storeFile(bucketId, filePath, options) - Uploads a file, returns state object

- [ ]  .storeFileCancel(state) - This will cancel an upload

- [ ] .resolveFile(bucketId, fileId, filePath, options) - Downloads a file, return state object

- [ ] .resolveFileCancel(state) - This will cancel a download

- [x] .deleteFile(bucketId, fileId, function(err, result) {}) - Deletes a file from a bucket

- [x] .destroy() - This will zero and free memory of encryption keys and the environment



