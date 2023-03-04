const fs = require('fs');

class MongoStore {
    constructor({ mongoose, connection, mongo } = {}) {
        if (!mongoose && !connection) throw new Error('A valid Mongoose instance or connection is required for MongoStore.');
        if (mongoose && connection) throw new Error('Use only one option for the store, a Mongoose instance or Mongoose Connection');
        if (connection && !mongo) throw new Error('The MongoDB Driver contained in mongoose is required to use a Mongoose Connection');
        if (this.mongoose) {
            this.mongoose = mongoose;
        } else {
            this.connection = connection;
            this.mongo = mongo
        }
    }

    async sessionExists(options) {
        if (this.mongoose) {
            let multiDeviceCollection = this.mongoose.connection.db.collection(`whatsapp-${options.session}.files`);
            let hasExistingSession = await multiDeviceCollection.countDocuments();
            return !!hasExistingSession;
        }
        if (this.connection) {
            let multiDeviceCollection = this.connection.db.collection(`whatsapp-${options.session}.files`);
            let hasExistingSession = await multiDeviceCollection.countDocuments();
            return !!hasExistingSession;
        }
    }

    async save(options) {
        if (this.mongoose) {
            var bucket = new this.mongoose.mongo.GridFSBucket(this.mongoose.connection.db, {
                bucketName: `whatsapp-${options.session}`
            });
            await new Promise((resolve, reject) => {
                fs.createReadStream(`${options.session}.zip`)
                    .pipe(bucket.openUploadStream(`${options.session}.zip`))
                    .on('error', err => reject(err))
                    .on('close', () => resolve());
            });
            options.bucket = bucket;
            await this.#deletePrevious(options);
        }
        if (this.connection) {
            var bucket = new this.mongo.GridFSBucket(this.mongoose.connection.db, {
                bucketName: `whatsapp-${options.session}`
            });
            await new Promise((resolve, reject) => {
                fs.createReadStream(`${options.session}.zip`)
                    .pipe(bucket.openUploadStream(`${options.session}.zip`))
                    .on('error', err => reject(err))
                    .on('close', () => resolve());
            });
            options.bucket = bucket;
            await this.#deletePrevious(options);

        }
    }

    async extract(options) {
        if (this.mongoose) {
            var bucket = new this.mongoose.mongo.GridFSBucket(this.mongoose.connection.db, {
                bucketName: `whatsapp-${options.session}`
            });
            return new Promise((resolve, reject) => {
                bucket.openDownloadStreamByName(`${options.session}.zip`)
                    .pipe(fs.createWriteStream(options.path))
                    .on('error', err => reject(err))
                    .on('close', () => resolve());
            });
        }
        if (this.connection) {
            var bucket = new this.mongo.GridFSBucket(this.connection.db, {
                bucketName: `whatsapp-${options.session}`
            });
            return new Promise((resolve, reject) => {
                bucket.openDownloadStreamByName(`${options.session}.zip`)
                    .pipe(fs.createWriteStream(options.path))
                    .on('error', err => reject(err))
                    .on('close', () => resolve());
            });
        }
    }

    async delete(options) {
        if (this.mongoose) {
            var bucket = new this.mongoose.mongo.GridFSBucket(this.mongoose.connection.db, {
                bucketName: `whatsapp-${options.session}`
            });
            const documents = await bucket.find({
                filename: `${options.session}.zip`
            }).toArray();

            documents.map(async doc => {
                return bucket.delete(doc._id);
            });
        }
        if (this.connection) {
            var bucket = new this.mongo.GridFSBucket(this.connection.db, {
                bucketName: `whatsapp-${options.session}`
            });
            const documents = await bucket.find({
                filename: `${options.session}.zip`
            }).toArray();

            documents.map(async doc => {
                return bucket.delete(doc._id);
            });
        }
    }

    async #deletePrevious(options) {
        const documents = await options.bucket.find({
            filename: `${options.session}.zip`
        }).toArray();
        if (documents.length > 1) {
            const oldSession = documents.reduce((a, b) => a.uploadDate < b.uploadDate ? a : b);
            return options.bucket.delete(oldSession._id);
        }
    }
}

module.exports = MongoStore;