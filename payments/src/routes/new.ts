import {
    BadRequestError,
    NotAuthorizedError,
    NotFoundError,
    OrderStatus,
    requireAuth,
    validateRequest,
} from "@grasticketing/common";
import { Request, Response, Router } from "express";
import { body } from "express-validator";
import { Order } from "../models/order";

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
    async (req: Request, res: Response) => {
        const { token, orderId } = req.body;

        // find the order
        const order = await Order.findById(orderId);

        // check if exist
        if (!order) throw new NotFoundError();

        // check if user create the order
        if (order.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }

        // check if order is cancelled
        if (order.status === OrderStatus.Cancelled) {
            throw new BadRequestError("Cannot pay for an cancelled order");
        }

        res.send({ success: true });
    }
);

export { router as createChargeRouter };
