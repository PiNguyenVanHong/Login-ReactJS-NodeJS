import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import ENV from '../config.js';

async function connect() {
    const mongodb = await MongoMemoryServer.create();
    const getUri = mongodb.getUri();

    mongoose.set('strictQuery', true);
    // const db = await mongoose.connect(getUri); ENV.ATLAS_URI
    const db = await mongoose.connect(ENV.ATLAS_URI);
        console.log("Database Connected");
    return db;
}

export default connect;