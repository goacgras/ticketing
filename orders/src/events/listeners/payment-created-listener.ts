import {
    Listener,
    OrderStatus,
    PaymentCreatedEvent,
    Subjects,
} from "@grasticketing/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { queueGroupName } from "./queue-group-name";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: PaymentCreatedEvent["data"], msg: Message) {
        // find the order
        const order = await Order.findById(data.orderId);

        // check if its exist
        if (!order) throw new Error("Order not found");

        // change order status
        order.set({ status: OrderStatus.Complete });

        // save
        await order.save();

        // acknowledge
        msg.ack();
    }
}
