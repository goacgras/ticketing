import { NextFunction, Request, Response } from "express";
import { CustomError } from "../errors/custom-error";

//this middleware will catch errors
export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof CustomError) {
        return res
            .status(err.statusCode)
            .send({ errors: err.serilizeErrors() });
    }

    res.status(400).send({
        errors: [{ message: "Something went wrong" }],
    });
};
