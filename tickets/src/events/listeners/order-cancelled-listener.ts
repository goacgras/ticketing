import { Listener, OrderCancelledEvent, Subjects } from "@grasticketing/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { queueGroupName } from "./queue-group-name";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
        // find the ticket
        const ticket = await Ticket.findById(data.ticket.id);

        // check if exist
        if (!ticket) throw new Error("Ticket not found");

        // clear the OrderId and save
        ticket.set({ orderId: undefined });
        await ticket.save();

        // publish an updated event
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            orderId: ticket.orderId,
            userId: ticket.userId,
            price: ticket.price,
            title: ticket.title,
            version: ticket.version,
        });

        // ack the message
        msg.ack();
    }
}
