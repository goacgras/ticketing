import { Order, OrderStatus } from "../../models/order";
import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";

it("marks an order as cancelled", async () => {
    // create a ticket
    const ticket = Ticket.build({
        title: "Test Ticket",
        price: 50,
    });
    await ticket.save();

    const user = global.signin();
    // make a request to create an order
    const { body: order } = await request(app)
        .post("/api/orders")
        .set("Cookie", user)
        .send({
            ticketId: ticket.id,
        })
        .expect(201);

    // make a request to cancel the order
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set("Cookie", user)
        .send()
        .expect(204);

    // check if order is cancelled
    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it.todo("emits a order cancelled event");
