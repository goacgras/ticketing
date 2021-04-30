import { OrderCancelledEvent, OrderStatus } from "@grasticketing/common";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";

const setup = async () => {
    // listener
    const listener = new OrderCancelledListener(natsWrapper.client);

    // create order and save
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        price: 100,
        status: OrderStatus.Created,
        userId: "123",
        version: 0,
    });
    await order.save();

    // create fake data
    const data: OrderCancelledEvent["data"] = {
        id: order.id,
        version: 1,
        ticket: {
            id: "111",
        },
    };

    // @ts-ignore
    const msg: Message = {
        // mock
        ack: jest.fn(),
    };

    return {
        listener,
        data,
        msg,
        order,
    };
};

it("Changes the order status", async () => {
    const { data, listener, msg, order } = await setup();

    // listen to event
    await listener.onMessage(data, msg);

    // find the order
    const updatedOrder = await Order.findById(order.id);

    // check if status has changed
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("Ack the message", async () => {
    const { data, listener, msg } = await setup();

    // listen to event
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});
