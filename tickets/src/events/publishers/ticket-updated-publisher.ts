import { Publisher, Subjects, TicketUpdatedEvent } from "@grasticketing/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
}
