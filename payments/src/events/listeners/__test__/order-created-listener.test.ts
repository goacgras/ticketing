import { OrderCreatedEvent, OrderStatus } from "@grasticketing/common";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);

    // fake data
    const data: OrderCreatedEvent["data"] = {
        id: mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        expiresAt: "1213",
        userId: "123",
        version: 0,
        ticket: {
            id: "123",
            price: 30,
        },
    };

    // fake msg
    // @ts-ignore
    const msg: Message = {
        // mock fn
        ack: jest.fn(),
    };

    return {
        listener,
        msg,
        data,
    };
};

it("listen to an event and create order", async () => {
    const { listener, data, msg } = await setup();

    // call onMessage fn
    await listener.onMessage(data, msg);

    // find the order
    const order = await Order.findById(data.id);

    expect(order!.price).toEqual(data.ticket.price);
});

it("acks the message", async () => {
    const { listener, data, msg } = await setup();

    // call onMessage fn
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});
