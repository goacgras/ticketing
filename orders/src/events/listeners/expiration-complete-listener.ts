import {
    ExpirationCompleteEvent,
    Listener,
    OrderStatus,
    Subjects,
} from "@grasticketing/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";
import { queueGroupName } from "./queue-group-name";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
    queueGroupName = queueGroupName;

    async onMessage(data: ExpirationCompleteEvent["data"], msg: Message) {
        // find the order
        const order = await Order.findById(data.orderId).populate("ticket");

        // if not found
        if (!order) throw new Error("order not found");

        // change order status & save
        // no need to change the ticket to null because isReserved method
        order.set({ status: OrderStatus.Cancelled });
        await order.save();

        // publish an event
        await new OrderCancelledPublisher(this.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id,
            },
        });

        // acknowledge
        msg.ack();
    }
}
