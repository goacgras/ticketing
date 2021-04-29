import { Listener, OrderCreatedEvent, Subjects } from "@grasticketing/common";
import { Message } from "node-nats-streaming";
import { expirationQueue } from "../../queues/expiration-queue";
import { queueGroupName } from "./queue-group-name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
        // calculate the delay
        // difference between expires and current time in milisecond
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
        console.log("processing the job..., time in ms: ", delay);

        // create new job
        expirationQueue.add(
            {
                orderId: data.id,
            },
            {
                //milisecond
                delay,
            }
        );

        // acknowledge the event has been recieved
        msg.ack();
    }
}
