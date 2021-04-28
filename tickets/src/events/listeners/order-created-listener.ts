import {
    Listener,
    OrderCancelledEvent,
    OrderCreatedEvent,
    Subjects,
} from "@grasticketing/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
        const { id } = data;
    }
}
