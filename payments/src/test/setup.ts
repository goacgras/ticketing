import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

declare global {
    namespace NodeJS {
        interface Global {
            signin(id?: string): string[];
        }
    }
}

//mocking natsWrapper
jest.mock("../nats-wrapper.ts");

// set stripe secret key for stripe realistic test
// why before, cuz it going to be use the instance on stripe
process.env.STRIPE_KEY =
    "sk_test_51IlxhPHTEyf9YdIFPT83jjvRL4LU5GhHXvJvpOH8Bp1i7lIDXPvTKxBoYE6CiGurE2QV7DOKqU9JIUXCDUbbwGBV00E0QM4Eni";

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
    // reset mock function
    jest.clearAllMocks();
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
global.signin = (id?: string) => {
    //build  a JWT payload. {id, email}
    const payload = {
        id: id || new mongoose.Types.ObjectId().toHexString(),
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
