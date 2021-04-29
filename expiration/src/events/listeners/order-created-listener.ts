import { Listener, OrderCreatedEvent, Subjects } from "@grasticketing/common";
import { Message } from "node-nats-streaming";
import { expirationQueue } from "../../queues/expiration-queue";
import { queueGroupName } from "./queue-group-name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
        // create new job
        expirationQueue.add({
            orderId: data.id,
        });

        // acknowledge the event has been revieved
        msg.ack();
    }
}
