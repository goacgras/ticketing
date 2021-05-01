import {
    BadRequestError,
    NotAuthorizedError,
    NotFoundError,
    OrderStatus,
    requireAuth,
    validateRequest,
} from "@grasticketing/common";
import { stripe } from "../stripe";
import { Request, Response, Router } from "express";
import { body } from "express-validator";
import { Order } from "../models/order";
import { Payment } from "../models/payment";
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";
import { natsWrapper } from "../nats-wrapper";

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

        // create a stripe charge
        const charge = await stripe.charges.create({
            currency: "usd",
            amount: order.price * 100,
            source: token,
        });

        // create a new payment
        const payment = Payment.build({
            orderId,
            stripeId: charge.id,
        });
        await payment.save();

        // publish an event
        new PaymentCreatedPublisher(natsWrapper.client).publish({
            id: payment.id,
            orderId: payment.id,
            stripeId: payment.stripeId,
        });

        res.status(201).send({ id: payment.id });
    }
);

export { router as createChargeRouter };
