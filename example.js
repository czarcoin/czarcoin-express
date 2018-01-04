require('dotenv').config();
const express = require('express');
const app = express();
const storj = require('./index');

app.use('/storj', storj({
  bridgeUrl: 'https://api.storj.io',
  bridgeUser: process.env.BRIDGE_USER,
  bridgePass: process.env.BRIDGE_PASSWORD,
  encryptionKey: process.env.ENCRYPTION_KEY,
  logLevel: process.env.LOG_LEVEL || 4
}));

app.listen(1337, () => {
  console.log('storj endpoint available on port 1337');
});
