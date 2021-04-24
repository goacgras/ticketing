import mongoose from "mongoose";
import { app } from "./app";
import { natsWrapper } from "./nats-wrapper";

const start = async () => {
    if (!process.env.JWT_KEY) {
        throw new Error("JWT_KEY must be defined");
    }

    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI must be defined");
    }
    try {
        //clusterId created at depl file
        await natsWrapper.connect("ticketing", "abc", "http://nats-srv:4222");

        // Proper closing NATS server
        natsWrapper.client.on("close", () => {
            console.log("NATS connection closed");
            process.exit();
        });
        //watching for interupt signals
        process.on("SIGINT", () => natsWrapper.client.close());

        //watching terminated signals
        process.on("SIGTERM", () => natsWrapper.client.close());

        await mongoose.connect(process.env.MONGO_URI, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true,
        });
        console.log("Database connected");
    } catch (err) {
        console.log(err);
    }
    app.listen(3000, () => {
        console.log("Listening on port 3000");
    });
};

start();
