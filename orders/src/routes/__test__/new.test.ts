import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Order, OrderStatus } from "../../models/order";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

it("returns error if ticket does not exist", async () => {
    const ticketId = mongoose.Types.ObjectId();

    await request(app)
        .post("/api/orders")
        .set("Cookie", global.signin())
        .send({
            ticketId,
        })
        .expect(404);
});
it("returns error if ticket already reserved", async () => {
    //create ticket
    const ticket = Ticket.build({
        title: "new ticket",
        price: 100,
    });
    await ticket.save();

    //create order to ticket above
    const order = Order.build({
        ticket,
        userId: "123123",
        status: OrderStatus.Created,
        expiresAt: new Date(),
    });
    await order.save();

    //make a request to order reserved ticket
    await request(app)
        .post("/api/orders")
        .set("Cookie", global.signin())
        .send({
            ticketId: ticket.id,
        })
        .expect(400);
});
it("reserve a ticket", async () => {
    //create ticket
    const ticket = Ticket.build({
        title: "new ticket",
        price: 100,
    });
    await ticket.save();

    //order a ticket
    await request(app)
        .post("/api/orders")
        .set("Cookie", global.signin())
        .send({
            ticketId: ticket.id,
        })
        .expect(201);
});

it("emmits an order created event", async () => {
    //create ticket
    const ticket = Ticket.build({
        title: "new ticket",
        price: 100,
    });
    await ticket.save();

    //order a ticket
    await request(app)
        .post("/api/orders")
        .set("Cookie", global.signin())
        .send({
            ticketId: ticket.id,
        })
        .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
