import { OrderCancelledEvent } from "@grasticketing/common";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";

const setup = async () => {
    // create listener
    const listener = new OrderCancelledListener(natsWrapper.client);

    // create orderId
    const orderId = mongoose.Types.ObjectId().toHexString();

    // create and save a ticket
    const ticket = Ticket.build({
        userId: "123",
        title: "concert",
        price: 123,
    });
    ticket.set({ orderId });
    await ticket.save();

    // create a fake data object
    const data: OrderCancelledEvent["data"] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id,
        },
    };

    // create a fake msg object
    // @ts-ignore
    const msg: Message = {
        // jest mock
        ack: jest.fn(),
    };

    // returns
    return {
        listener,
        ticket,
        data,
        msg,
        orderId,
    };
};

it("set orderId to undefined", async () => {
    const { data, listener, msg, ticket } = await setup();

    // call onMessage fn
    await listener.onMessage(data, msg);

    // find the ticket
    const updatedTicket = await Ticket.findById(ticket.id);

    // check if orderId set to undefined
    expect(updatedTicket!.orderId).not.toBeDefined();
});

it("ack the message", async () => {
    const { data, listener, msg } = await setup();

    // call onMessage
    await listener.onMessage(data, msg);

    // check if ack?
    expect(msg.ack).toHaveBeenCalled();
});

it("publish a ticket cancelled event", async () => {
    const { listener, data, msg, orderId } = await setup();

    // call the listener onMessage
    await listener.onMessage(data, msg);

    // check if published an event
    expect(natsWrapper.client.publish).toHaveBeenCalled();

    // get the event publish data
    const ticketUpdatedData = JSON.parse(
        (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    );

    // check if equal
    expect(data.ticket.id).toEqual(ticketUpdatedData.id);
});
