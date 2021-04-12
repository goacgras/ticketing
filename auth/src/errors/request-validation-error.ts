import { ValidationError } from "express-validator";
import { CustomError } from "./custom-error";

export class RequestValidationError extends CustomError {
    statusCode = 400;
    //private is same as this.errors = errors
    constructor(public errors: ValidationError[]) {
        super("Invalid request parameters");

        //Only because we are extending a built in class (ts)
        Object.setPrototypeOf(this, RequestValidationError.prototype);
    }

    serilizeErrors() {
        return this.errors.map((error) => {
            return {
                message: error.msg,
                field: error.param,
            };
        });
    }
}
