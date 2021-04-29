import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { ExpirationCompleteListener } from "../expiration-complete-listener";
import mongoose from "mongoose";
import { Order, OrderStatus } from "../../../models/order";
import { ExpirationCompleteEvent } from "@grasticketing/common";
import { Message } from "node-nats-streaming";

const setup = async () => {
    // create listener
    const listener = new ExpirationCompleteListener(natsWrapper.client);

    // create ticket & save
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: "concert",
        price: 30,
    });
    await ticket.save();

    // create order
    const order = Order.build({
        userId: "123",
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket,
    });
    await order.save();

    // create data
    const data: ExpirationCompleteEvent["data"] = {
        orderId: order.id,
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return {
        listener,
        order,
        ticket,
        msg,
        data,
    };
};

it("updates order status to cancelled", async () => {
    const { listener, data, msg, order } = await setup();

    // call onMessage fn
    await listener.onMessage(data, msg);

    // find the order
    const foundOrder = await Order.findById(order.id);

    // check the status
    expect(foundOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("emmits an order cancelled event", async () => {
    const { listener, data, msg, order } = await setup();

    // call onMessage fn
    await listener.onMessage(data, msg);

    // check if it publish an event
    expect(natsWrapper.client.publish).toHaveBeenCalled();

    // pull the data out of event
    const eventData = JSON.parse(
        (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    );

    expect(eventData.id).toEqual(order.id);
});

it("ack the message", async () => {
    const { listener, data, msg } = await setup();

    // call onMessage fn
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});
