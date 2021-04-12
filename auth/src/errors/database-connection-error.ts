import { CustomError } from "./custom-error";

export class DatabaseConnectionError extends CustomError {
    statusCode = 500;
    reason = "Error connecting to database";
    constructor() {
        super("Error connecting db");
        Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
    }

    serilizeErrors() {
        return [{ message: this.reason }];
    }
}
