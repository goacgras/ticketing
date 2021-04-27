import { TicketCreatedEvent } from "@grasticketing/common";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketCreatedListener } from "../ticket-created-listener";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
    // create an instance of listener
    const listener = new TicketCreatedListener(natsWrapper.client);

    // create a fake data event
    const data: TicketCreatedEvent["data"] = {
        version: 0,
        id: mongoose.Types.ObjectId().toHexString(),
        title: "concert",
        price: 10,
        userId: mongoose.Types.ObjectId().toHexString(),
    };

    // create a fake Message object
    // @ts-ignore
    const msg: Message = {
        // jest mock
        ack: jest.fn(),
    };

    return {
        listener,
        data,
        msg,
    };
};

it("create and save ticket", async () => {
    const { data, listener, msg } = await setup();

    // call the onMessage fn with data object + Message object
    await listener.onMessage(data, msg);

    // write assertion to make sure a ticket was created
    const ticket = await Ticket.findById(data.id);

    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual(data.title);
    expect(ticket!.price).toEqual(data.price);
});

it("acks the message", async () => {
    const { data, listener, msg } = await setup();

    // call the onMessage fn with data object + Message object
    await listener.onMessage(data, msg);

    // write assertion ack fn is called
    expect(msg.ack).toHaveBeenCalled();
});
