import {
    Listener,
    OrderCancelledEvent,
    OrderStatus,
    Subjects,
} from "@grasticketing/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { queueGroupName } from "./queue-group-name";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
        // find with id and version
        const order = await Order.findByEvent(data);

        if (!order) throw new Error("Order not found");

        order.set({ status: OrderStatus.Cancelled });
        await order.save();

        msg.ack();
    }
}
