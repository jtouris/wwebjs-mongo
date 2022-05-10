# wwebjs-mongo
A MongoDB plugin for whatsapp-web.js

## Quick Links

* [Guide / Getting Started](https://wwebjs.dev/guide/authentication.html) _(work in progress)_
* [GitHub](https://github.com/jtourisNS/wwebjs-mongo)

## Installation

The module is now available on npm! `npm i wwebjs-mongo`


## Example usage

```js
const { Client, RemoteAuth } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI);
const store = new MongoStore({ mongoose: mongoose });
const client = new Client({
    authStrategy: new RemoteAuth({
        store: store,
        backupSyncMs: 180000
    })
});

client.initialize();

```