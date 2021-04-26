import { requireAuth } from "@grasticketing/common";
import { Request, Response, Router } from "express";
import { Order } from "../models/order";

const router = Router();

router.get("/api/orders", requireAuth, async (req: Request, res: Response) => {
    const orders = await Order.find({
        userId: req.currentUser!.id,
    }).populate("ticket"); //column name;

    res.send(orders);
});

export { router as indexOrderRouter };
