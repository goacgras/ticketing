import { Listener, Subjects, TicketUpdatedEvent } from "@grasticketing/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
    queueGroupName = queueGroupName;

    async onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
        //find the ticket
        const ticket = await Ticket.findByEvent(data);

        // if not found
        if (!ticket) throw new Error("Ticket not found");

        // add version property to increment without plugin
        const { title, price } = data;
        // update the ticket

        ticket.set({ title, price });
        // when its save, it will increment the version
        await ticket.save();

        // tell nats we already processed the data
        msg.ack();
    }
}
