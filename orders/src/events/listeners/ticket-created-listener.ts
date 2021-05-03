import { Listener, Subjects, TicketCreatedEvent } from "@grasticketing/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: TicketCreatedEvent["data"], msg: Message) {
        // extracting info from data
        const { id, title, price } = data;

        // safe the data / duplicating to Ticket model
        const ticket = Ticket.build({
            id,
            price,
            title,
        });
        //set version to 0
        await ticket.save();

        // tell nats we already process the data
        msg.ack();
    }
}
