import {
    ExpirationCompleteEvent,
    Publisher,
    Subjects,
} from "@grasticketing/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
}
