import {
    Listener,
    Subjects,
    TicketCreatedEvent,
    TicketUpdatedEvent,
} from "@grasticketing/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
        // extracting info from data
        const { title, price } = data;

        // safe the data / duplicating to Ticket model
        const ticket = Ticket.build({
            price,
            title,
        });
        await ticket.save();

        // tell nats we already process the data
        msg.ack();
    }
}
