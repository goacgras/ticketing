import { OrderCreatedEvent, OrderStatus } from "@grasticketing/common";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";

const setup = async () => {
    // create an istance of listener
    const listener = new OrderCreatedListener(natsWrapper.client);

    // create and save a ticket
    const ticket = Ticket.build({
        title: "concert",
        price: 50,
        userId: "123",
    });
    await ticket.save();

    // create the fake data object
    const data: OrderCreatedEvent["data"] = {
        id: mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        userId: "123",
        expiresAt: "213213",
        version: 0,
        ticket: {
            id: ticket.id,
            price: ticket.price,
        },
    };

    // create a fake message object
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
    };
};

it("sets the orderId of the ticket", async () => {
    const { data, listener, ticket, msg } = await setup();

    // call the onMessage fn with data object + Message object
    await listener.onMessage(data, msg);

    // find the updated ticket
    const updatedTicket = await Ticket.findById(ticket.id);

    // check the updated ticket has orderId property set
    expect(updatedTicket!.orderId).toEqual(data.id);
});

it("ack the message", async () => {
    const { listener, msg, data } = await setup();

    // call the onMessage fn with data object + Message object
    await listener.onMessage(data, msg);

    // ack fn is called?
    expect(msg.ack).toHaveBeenCalled();
});

it("publish a ticket updated event", async () => {
    const { listener, data, msg } = await setup();

    // call on message fn
    await listener.onMessage(data, msg);

    // expect publish an event
    expect(natsWrapper.client.publish).toHaveBeenCalled();

    // check the data, access the mock object
    const ticketUpdatedData = JSON.parse(
        (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    );

    // expect
    expect(data.id).toEqual(ticketUpdatedData.orderId);
});
