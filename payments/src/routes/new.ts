import { requireAuth, validateRequest } from "@grasticketing/common";
import { Request, Response, Router } from "express";
import { body } from "express-validator";

const router = Router();

router.post(
    "/api/payments",
    requireAuth,
    [
        body("token").not().isEmpty().withMessage("Token must not be empty"),
        body("orderId")
            .not()
            .isEmpty()
            .withMessage("orderId must not be empty"),
    ],
    validateRequest,
    (req: Request, res: Response) => {
        res.send({ success: true });
    }
);

export { router as createChargeRouter };
