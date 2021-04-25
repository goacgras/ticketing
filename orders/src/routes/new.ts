import mongoose from "mongoose";
import {
    BadRequestError,
    NotFoundError,
    OrderStatus,
    requireAuth,
    validateRequest,
} from "@grasticketing/common";
import { Request, Response, Router } from "express";
import { body } from "express-validator";
import { Ticket } from "../models/ticket";
import { Order } from "../models/order";

const router = Router();

router.post(
    "/api/orders",
    requireAuth,
    [
        body("ticketId")
            .not()
            .isEmpty()
            .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
            .withMessage("TicketId must be provided"),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { ticketId } = req.body;

        //find the ticket that user is trying to order
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            throw new NotFoundError();
        }

        //Check the ticket status, make sure it is not reserved
        //Run query to look all orders. Find an order where the ticket,
        //is the ticket we just found *and* the order status is *not* cancelled
        //if we find an order from that means the ticket *is* reserved
        //meaning: find order with status below, if we found, user cant attempt to reserved
        const existingOrder = await Order.findOne({
            ticket: ticket,
            status: {
                $in: [
                    OrderStatus.Created,
                    OrderStatus.Complete,
                    OrderStatus.AwaitingPayment,
                ],
            },
        });
        if (existingOrder) {
            throw new BadRequestError("Ticket is already reserved");
        }

        //calculate the expiration

        //build the order and save it to db

        //publish an event

        res.send({});
    }
);

export { router as newOrderRouter };
