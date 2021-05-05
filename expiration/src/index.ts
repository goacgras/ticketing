import { OrderCreatedListener } from "./events/listeners/order-created-listener";
import { natsWrapper } from "./nats-wrapper";

const start = async () => {
    console.log("starting...");
    try {
        if (!process.env.NATS_CLIENT_ID) {
            throw new Error("NATS_CLIENT_ID must be defined");
        }
        if (!process.env.NATS_URL) {
            throw new Error("NATS_URL must be defined");
        }

        if (!process.env.NATS_CLUSTER_ID) {
            throw new Error("NATS_CLUSTER_ID must be defined");
        }
        //clusterId created at depl file
        await natsWrapper.connect(
            process.env.NATS_CLUSTER_ID,
            process.env.NATS_CLIENT_ID,
            process.env.NATS_URL
        );

        // Proper closing NATS server
        natsWrapper.client.on("close", () => {
            console.log("NATS connection closed");
            process.exit();
        });
        //watching for interupt signals
        process.on("SIGINT", () => natsWrapper.client.close());

        //watching terminated signals
        process.on("SIGTERM", () => natsWrapper.client.close());

        new OrderCreatedListener(natsWrapper.client).listen();
    } catch (err) {
        console.log(err);
    }
};

start();
