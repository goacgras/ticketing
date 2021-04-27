import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import mongoose from "mongoose";
import { TicketUpdatedEvent } from "@grasticketing/common";
import { Message } from "node-nats-streaming";

const setup = async () => {
    // Create a listener
    const listener = new TicketUpdatedListener(natsWrapper.client);

    // Create & save a ticket
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: "concert",
        price: 23,
    });
    await ticket.save();

    // create fake data object
    const data: TicketUpdatedEvent["data"] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: "updated",
        price: 100,
        userId: "123",
    };

    // create fake msg obj
    // @ts-ignore
    const msg: Message = {
        // jest mock
        ack: jest.fn(),
    };

    // return
    return {
        listener,
        data,
        msg,
        ticket,
    };
};

it("finds, updates, and saves a ticket", async () => {
    const { data, listener, msg, ticket } = await setup();

    // call the onMessage fn with data object + Message object
    await listener.onMessage(data, msg);

    // find the ticket
    const updatedTicket = await Ticket.findById(ticket.id);

    // expects
    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
});

it("acks the message", async () => {
    const { data, listener, msg } = await setup();

    // call the onMessage fn with data object + Message object
    await listener.onMessage(data, msg);

    // assertion if ack fn is called
    expect(msg.ack).toHaveBeenCalled();
});

it("does not called act if event version out of order", async () => {
    const { msg, data, listener } = await setup();

    // create out of order version
    data.version = 10;

    try {
        // call the onMessage fn with data object + Message object
        await listener.onMessage(data, msg);
    } catch (err) {}

    // ack has not been called
    expect(msg.ack).not.toHaveBeenCalled();
});
