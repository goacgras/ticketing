import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";

it("has a route listening to /api/tickets for post requests", async () => {
    const response = await request(app).post("/api/tickets").send({});

    expect(response.status).not.toEqual(404);
});
it("can only access if user sign in", async () => {
    await request(app).post("/api/tickets").send({}).expect(401);
});

it("returns other than 401 if user sign in", async () => {
    const response = await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signin())
        .send({});

    expect(response.status).not.toEqual(401);
});
it("return an error if an invalid title is provided", async () => {
    await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signin())
        .send({
            title: "",
            price: 10,
        })
        .expect(400);
    await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signin())
        .send({
            price: 10,
        })
        .expect(400);
});
it("return an error if invalid price provided", async () => {
    await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signin())
        .send({
            title: "test",
            price: -50,
        })
        .expect(400);
    await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signin())
        .send({
            title: "test",
        })
        .expect(400);
});
it("creates a ticket with valid input", async () => {
    //add in check to make sure ticket was saved
    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);

    const title = "test";

    await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signin())
        .send({
            title,
            price: 20,
        })
        .expect(201);

    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
    expect(tickets[0].title).toEqual(title);
    expect(tickets[0].price).toEqual(20);
});
