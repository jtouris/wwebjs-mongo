# wwebjs-mongo
A MongoDB plugin for whatsapp-web.js! 

Use MongoStore to save your WhatsApp MultiDevice session on a MongoDB Database.

## Quick Links

* [Guide / Getting Started](https://wwebjs.dev/guide/authentication.html) _(work in progress)_
* [GitHub](https://github.com/jtourisNS/wwebjs-mongo)
* [npm](https://www.npmjs.com/package/wwebjs-mongo)

## Installation

The module is now available on npm! `npm i wwebjs-mongo`


## Example usage

```js
const { Client, RemoteAuth } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(() => {
    const store = new MongoStore({ mongoose: mongoose });
    const client = new Client({
        authStrategy: new RemoteAuth({
            store: store,
            backupSyncIntervalMs: 300000
        })
    });

    client.initialize();
});

```

## Delete Remote Session

How to force delete a specific remote session on the Database:

```js
await store.delete({session: 'yourSessionName'});
```