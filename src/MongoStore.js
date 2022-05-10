const fs = require('fs');

class MongoStore {
    constructor({ mongoose } = {}) {
        if(!mongoose) throw new Error('A valid Mongoose instance is required for MongoStore.');
        this.mongoose = mongoose;
    }

    async sessionExists(options) {
        try {
            let multiDeviceCollection = this.mongoose.connection.db.collection(`multidevice-${options.session}.files`);
            let hasExistingSession = await multiDeviceCollection.countDocuments();
            return !!hasExistingSession;   
        } catch (error) {
            console.log('Error on MongoStore: sessionExists => ', error);
        }
    }
    
    async save(options) {
        try {
            var bucket = new this.mongoose.mongo.GridFSBucket(this.mongoose.connection.db, {
                bucketName: `multidevice-${options.session}`
            });
            return new Promise((resolve, reject) => {
                fs.createReadStream(`${options.session}.zip`)
                    .pipe(bucket.openUploadStream(`${options.session}.zip`))
                    .on('error', err => reject(err))
                    .on('close', () => resolve());
            });
        } catch (error) {
            console.log('Error on MongoStore: save => ', error);
        }
    }

    async extract(options) {
        try {
            var bucket = new this.mongoose.mongo.GridFSBucket(this.mongoose.connection.db, {
                bucketName: `multidevice-${options.session}`
            });
            return new Promise((resolve, reject) => {
                bucket.openDownloadStreamByName(`${options.session}.zip`)
                    .pipe(fs.createWriteStream(`RemoteAuth-${options.session}.zip`))
                    .on('error', err => reject(err))
                    .on('close', () => resolve());
            });
        } catch (error) {
            console.log('Error on MongoStore: extract => ', error);
        }
    }

    async delete(options) {
        try {
            var bucket = new this.mongoose.mongo.GridFSBucket(this.mongoose.connection.db, {
                bucketName: `multidevice-${options.session}`
            });
            const documents = await bucket.find({
                filename: `${options.session}.zip`
            }).toArray();
    
            documents.map(async doc => {
                return bucket.delete(doc._id);
            });   
        } catch (error) {
            console.log('Error on MongoStore: delete => ', error);
        }
    }
}

module.exports = MongoStore;