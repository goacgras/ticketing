import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Order } from "../../models/order";
import { OrderStatus } from "@grasticketing/common";

it("returns 404 when purchasing an order that does not exist", async () => {
    await request(app)
        .post("/api/payments")
        .set("Cookie", global.signin())
        .send({
            token: "123123",
            orderId: mongoose.Types.ObjectId().toHexString(),
        })
        .expect(404);
});

it("returns a 401 when purchasing an order does not belong to user", async () => {
    // create a new order
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        userId: mongoose.Types.ObjectId().toHexString(),
        price: 50,
        status: OrderStatus.Created,
        version: 0,
    });
    await order.save();

    // request the order with different user
    await request(app)
        .post("/api/payments")
        .set("Cookie", global.signin())
        .send({
            token: "123123123",
            orderId: order.id,
        })
        .expect(401);
});
it("returns a 400 when purchasing a cancelled order", async () => {
    // create userId
    const userId = mongoose.Types.ObjectId().toHexString();

    // create a new order
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        userId,
        price: 50,
        status: OrderStatus.Cancelled,
        version: 0,
    });
    await order.save();

    await request(app)
        .post("/api/payments")
        .set("Cookie", global.signin(userId))
        .send({
            token: "123123123",
            orderId: order.id,
        })
        .expect(400);
});