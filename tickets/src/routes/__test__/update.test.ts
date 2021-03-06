import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import { natsWrapper } from "../../nats-wrapper";
import { Ticket } from "../../models/ticket";

it("return 404 of provided id does not exist", async () => {
    const id = mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .set("Cookie", global.signin())
        .send({
            title: "asdasd",
            price: 20,
        })
        .expect(404);
});
it("return 401 if the user is not authenticated", async () => {
    const id = mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .send({
            title: "asdasd",
            price: 20,
        })
        .expect(401);
});
it("return 401 if the user does not own the ticket", async () => {
    const response = await request(app)
        .post("/api/tickets/")
        .set("Cookie", global.signin())
        .send({
            title: "asdasd",
            price: 20,
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set("Cookie", global.signin())
        .send({
            title: "qweqwe",
            price: 50,
        })
        .expect(401);
});
it("return 400 if the user provides an invalid title or price", async () => {
    const cookie = global.signin();
    const response = await request(app)
        .post("/api/tickets/")
        .set("Cookie", cookie)
        .send({
            title: "asdasd",
            price: 20,
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set("Cookie", cookie)
        .send({
            title: "",
            price: 20,
        })
        .expect(400);
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set("Cookie", cookie)
        .send({
            title: "ffffffff",
            price: -39,
        })
        .expect(400);
});
it("updates the ticket provided valid inputs", async () => {
    const cookie = global.signin();
    const response = await request(app)
        .post("/api/tickets")
        .set("Cookie", cookie)
        .send({
            title: "qweqwe",
            price: 20,
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set("Cookie", cookie)
        .send({
            title: "baru",
            price: 50,
        })
        .expect(200);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send();

    expect(ticketResponse.body.title).toEqual("baru");
    expect(ticketResponse.body.price).toEqual(50);
});

it("publishes an event", async () => {
    const cookie = global.signin();
    const response = await request(app)
        .post("/api/tickets")
        .set("Cookie", cookie)
        .send({
            title: "qweqwe",
            price: 20,
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set("Cookie", cookie)
        .send({
            title: "baru",
            price: 50,
        })
        .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("rejects updates if ticket is reserved", async () => {
    // sign in
    const cookie = global.signin();

    // create a ticket
    const response = await request(app)
        .post("/api/tickets")
        .set("Cookie", cookie)
        .send({
            title: "qweqwe",
            price: 20,
        });

    // find the ticket
    const ticket = await Ticket.findById(response.body.id);

    // reserve the ticket by adding orderId to the ticket
    ticket!.set({ orderId: mongoose.Types.ObjectId().toHexString() });
    await ticket!.save();

    // try to update the ticket
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set("Cookie", cookie)
        .send({
            title: "baru",
            price: 50,
        })
        .expect(400);
});
