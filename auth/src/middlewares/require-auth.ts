import { NextFunction, Request, Response } from "express";
import { NotAuthorizedError } from "../errors/not-authorized-error";

const requireAuth = (req: Request, _: Response, next: NextFunction) => {
    if (!req.currentUser) {
        throw new NotAuthorizedError();
    }

    next();
};
