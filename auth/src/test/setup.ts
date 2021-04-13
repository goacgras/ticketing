import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
// import { app } from "../app";

//before start
let mongo: any;
beforeAll(async () => {
    process.env.JWT_KEY = "asdasd";
    mongo = new MongoMemoryServer();
    const mongoUri = await mongo.getUri();

    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

//before each test
beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
});
