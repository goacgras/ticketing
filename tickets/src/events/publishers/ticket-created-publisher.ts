import { Publisher, Subjects, TicketCreatedEvent } from "@grasticketing/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
}
