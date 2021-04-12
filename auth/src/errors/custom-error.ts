//create abstract class to check if class that extends this class has proper properties declared in abstract class
export abstract class CustomError extends Error {
    abstract statusCode: number;

    //loging purpose (show message in log)
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, CustomError.prototype);
    }

    abstract serilizeErrors(): { message: string; field?: string }[];
}
