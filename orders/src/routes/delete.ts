import {
    NotAuthorizedError,
    NotFoundError,
    OrderStatus,
} from "@grasticketing/common";
import { Request, Response, Router } from "express";
import { Order } from "../models/order";

const router = Router();

//Cancelling the order
router.delete("/api/orders/:orderId", async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) throw new NotFoundError();
    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    res.status(204).send(order);
});

export { router as deleteOrderRouter };
