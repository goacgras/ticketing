import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import mongoose from "mongoose";

it("shows order from specific user", async () => {
    //Create ticket
    const ticket = Ticket.build({
        title: "Test Ticket",
        price: 50,
        id: mongoose.Types.ObjectId().toHexString(),
    });
    await ticket.save();

    const user = global.signin();
    //Make a request to create an order with existing ticket
    const { body: order } = await request(app)
        .post("/api/orders")
        .set("Cookie", user)
        .send({
            ticketId: ticket.id,
        })
        .expect(201);

    //fetch the order
    const { body: fetchOrder } = await request(app)
        .get(`/api/orders/${order.id}`)
        .set("Cookie", user)
        .send()
        .expect(200);

    expect(fetchOrder.id).toEqual(order.id);
});

it("return an error if user tries to fetch another user order", async () => {
    //Create ticket
    const ticket = Ticket.build({
        title: "Test Ticket",
        price: 50,
        id: mongoose.Types.ObjectId().toHexString(),
    });
    await ticket.save();

    const user = global.signin();
    //Make a request to create an order with existing ticket
    const { body: order } = await request(app)
        .post("/api/orders")
        .set("Cookie", user)
        .send({
            ticketId: ticket.id,
        })
        .expect(201);

    //fetch the order
    await request(app)
        .get(`/api/orders/${order.id}`)
        .set("Cookie", global.signin())
        .send()
        .expect(401);
});
