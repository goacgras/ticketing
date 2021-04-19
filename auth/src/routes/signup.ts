import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { body } from "express-validator";
import { BadRequestError, validateRequest } from "@grasticketing/common";
import { User } from "../models/user";

const router = Router();

router.post(
    "/api/users/signup",
    [
        body("email").isEmail().withMessage("Email must be valid"),
        body("password")
            .trim()
            .isLength({ min: 4, max: 20 })
            .withMessage("Password must be between 4 and 20 characters"),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new BadRequestError("Email already exist");
        }

        const newUser = User.build({ email, password });
        await newUser.save();

        //create jwt
        const userJwt = jwt.sign(
            {
                id: newUser.id,
                email: newUser.email,
            },
            process.env.JWT_KEY!
        );

        //store in session obj
        req.session = {
            jwt: userJwt,
        };

        res.status(201).send(newUser);
    }
);

export { router as signupRouter };
