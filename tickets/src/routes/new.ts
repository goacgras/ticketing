import { Request, Response, Router } from "express";
import { requireAuth, validateRequest } from "@grasticketing/common";
import { body } from "express-validator";

const router = Router();

router.post(
    "/api/tickets",
    requireAuth,
    [
        body("title").not().isEmpty().withMessage("Title is required"),
        body("price")
            .isFloat({ gt: 0 })
            .withMessage("Price must be greater than 0"),
    ],
    validateRequest,
    (req: Request, res: Response) => {
        res.status(200).send({});
    }
);

export { router as createTicketRouter };
