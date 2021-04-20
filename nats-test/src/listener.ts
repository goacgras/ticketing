import nats, { Message } from "node-nats-streaming";
import { randomBytes } from "crypto";

console.clear();

const stan = nats.connect("ticketing", randomBytes(4).toString("hex"), {
    url: "http://localhost:4222",
});

stan.on("connect", () => {
    console.log("listener connected to NATS");

    //setManualAckmode() = to have an option to send message with knowledge if message recieved / not
    //if we dont .ack() message will keep sending to member of queue group
    const options = stan.subscriptionOptions().setManualAckMode(true);
    const subscription = stan.subscribe(
        "ticket:created",
        "orders-service-queue-group",
        options
    );
    subscription.on("message", (msg: Message) => {
        const data = msg.getData();

        if (typeof data === "string") {
            console.log(
                `Recieved Event #${msg.getSequence()} with data: ${data}`
            );
        }

        //telling if we got the message
        msg.ack();
    });
});
