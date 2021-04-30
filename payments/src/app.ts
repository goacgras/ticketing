import express from "express";
import "express-async-errors";
import cookieSession from "cookie-session";
import {
    NotFoundError,
    errorHandler,
    currentUser,
} from "@grasticketing/common";
import { createChargeRouter } from "./routes/new";

const app = express();
//trust proxy behind ingress nginx
app.set("trust proxy", true);
app.use(express.json());
app.use(
    cookieSession({
        //do not encrypt
        signed: false,
        //https only
        secure: process.env.NODE_ENV !== "test",
    })
);
//middleware
app.use(currentUser);

// routes
app.use(createChargeRouter);

app.all("*", async () => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };
