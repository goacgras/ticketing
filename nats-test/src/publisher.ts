import nats from "node-nats-streaming";
import { TicketCreatedPulisher } from "./events/ticket-created-publisher";

console.clear();

const stan = nats.connect("ticketing", "abc", {
    url: "http://localhost:4222",
});

stan.on("connect", async () => {
    console.log("Publisher connected to NATS");

    const publisher = new TicketCreatedPulisher(stan);

    try {
        await publisher.publish({
            id: "111",
            title: "Football",
            price: 25,
        });
    } catch (err) {
        console.log(err);
    }

    // const data = JSON.stringify({
    //     id: "123",
    //     title: "concert",
    //     price: 20,
    // });

    // stan.publish("ticket:created", data, () => {
    //     console.log("Event published");
    // });
});
