import {
    OrderCancelledEvent,
    Publisher,
    Subjects,
} from "@grasticketing/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
}
