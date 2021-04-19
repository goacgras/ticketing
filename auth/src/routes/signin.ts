import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { body } from "express-validator";
import { BadRequestError, validateRequest } from "@grasticketing/common";
import { User } from "../models/user";
import { Password } from "../utils/password";

const router = Router();

router.post(
    "/api/users/signin",
    [
        body("email").isEmail().withMessage("Email must be valid"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password must not be empty"),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            throw new BadRequestError("Invalid credentials");
        }

        const matchedPassword = await Password.compare(
            existingUser.password,
            password
        );

        if (!matchedPassword) {
            throw new BadRequestError("Invalid credentials");
        }

        //create jwt
        const userJwt = jwt.sign(
            {
                id: existingUser.id,
                email: existingUser.email,
            },
            process.env.JWT_KEY!
        );

        //store in session obj
        req.session = {
            jwt: userJwt,
        };
        res.status(200).send(existingUser);
    }
);

export { router as signinRouter };
