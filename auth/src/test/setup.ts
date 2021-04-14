import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import mongoose from "mongoose";
import { app } from "../app";

declare global {
    namespace NodeJS {
        interface Global {
            signin(): Promise<string[]>;
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
global.signin = async () => {
    const email = "test@test.com";
    const password = "password";

    const signupResponse = await request(app)
        .post("/api/users/signup")
        .send({ email, password })
        .expect(201);
    const cookie = signupResponse.get("Set-Cookie");

    return cookie;
};
