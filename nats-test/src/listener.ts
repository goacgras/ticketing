import nats from "node-nats-streaming";
import { randomBytes } from "crypto";
import { TicketCreatedListener } from "./events/ticket-created-listener";

console.clear();

const stan = nats.connect("ticketing", randomBytes(4).toString("hex"), {
    url: "http://localhost:4222",
});

stan.on("connect", () => {
    console.log("listener connected to NATS");

    //when stan server close
    stan.on("close", () => {
        console.log("NATS connection closed");
        process.exit();
    });

    new TicketCreatedListener(stan).listen();

    //setManualAckmode() = to have an option to send message with knowledge if message recieved / not
    //if we dont .ack() message will keep sending to member of queue group
    // const options = stan
    //     .subscriptionOptions()
    //     .setManualAckMode(true)
    //     .setDeliverAllAvailable() // make NATS send all events that hasn't been emitted
    //     .setDurableName("accounting-service"); // giving identifier to subs, and marked as "processed" in NATS, so that when sub goes down it will understand which event has not been sent

    // queue group, other than to group the listerners, ex: 2 listeners
    // it also making sure if the listener goes down, it will not dump the history
    // const subscription = stan.subscribe(
    //     "ticket:created",
    //     "queue-group-name",
    //     options
    // );
    // subscription.on("message", (msg: Message) => {
    //     const data = msg.getData();

    //     if (typeof data === "string") {
    //         console.log(
    //             `Recieved Event #${msg.getSequence()} with data: ${data}`
    //         );
    //     }

    //     //telling if we got the message
    //     msg.ack();
    // });
});

//on termial ctrl + c || rs
//watching for interupt signals
process.on("SIGINT", () => stan.close());

//watching terminated signals
process.on("SIGTERM", () => stan.close());
