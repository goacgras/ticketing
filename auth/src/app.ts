import express from "express";
import "express-async-errors";
import cookieSession from "cookie-session";

import { NotFoundError } from "./errors/not-found-error";
import { errorHandler } from "./middlewares/error-handler";
import { currentUserRouter } from "./routes/current-user";
import { signinRouter } from "./routes/signin";
import { signoutRouter } from "./routes/signout";
import { signupRouter } from "./routes/signup";

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

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.all("*", async () => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };
