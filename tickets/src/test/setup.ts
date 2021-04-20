import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

declare global {
    namespace NodeJS {
        interface Global {
            signin(): string[];
        }
    }
}

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

// global fn that only available at test env
global.signin = () => {
    //build  a JWT payload. {id, email}
    const payload = {
        id: new mongoose.Types.ObjectId().toHexString(),
        email: "test@test.com",
    };

    //create the JWT!
    const token = jwt.sign(payload, process.env.JWT_KEY!);

    //build session object. {jwt: MY_JWT}
    const session = { jwt: token };

    //turn session into json
    const sessionJSON = JSON.stringify(session);

    //take JSON and encoded it as base64
    const base64 = Buffer.from(sessionJSON).toString("base64");

    //return string thats the cookie with encoded data
    return [`express:sess=${base64}`];
};
