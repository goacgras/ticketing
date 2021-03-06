import mongoose from "mongoose";
import { app } from "./app";

const start = async () => {
    console.log("starting again........");
    if (!process.env.JWT_KEY) {
        throw new Error("JWT_KEY must be define");
    }
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI must be define");
    }
    try {
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
