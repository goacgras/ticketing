import {
    PaymentCreatedEvent,
    Publisher,
    Subjects,
} from "@grasticketing/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
}
