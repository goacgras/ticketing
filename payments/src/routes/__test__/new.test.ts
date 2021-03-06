import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Order } from "../../models/order";
import { OrderStatus } from "@grasticketing/common";
import { stripe } from "../../stripe";
import { Payment } from "../../models/payment";

// use stripe mock fn instead
// jest.mock("../../stripe.ts");

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

it("return a 201 with valid inputs", async () => {
    // create userId
    const userId = mongoose.Types.ObjectId().toHexString();

    // create randomPrice
    const price = Math.floor(Math.random() * 100000);

    // create a new order with random price above
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        userId,
        price,
        status: OrderStatus.Created,
        version: 0,
    });
    await order.save();

    // make a request for payment
    await request(app)
        .post("/api/payments")
        .set("Cookie", global.signin(userId))
        .send({
            token: "tok_visa",
            orderId: order.id,
        })
        .expect(201);

    // ***REAL STRIPE TEST***
    // get back list of 10 most recent
    const stripeCharges = await stripe.charges.list({
        limit: 50,
    });

    // find the specific amount created above
    const stripeCharge = stripeCharges.data.find((charge) => {
        return charge.amount === price * 100;
    });

    // expect if the value is not undefined
    expect(stripeCharge).toBeDefined();
    expect(stripeCharge!.currency).toEqual("usd");

    // find the payment
    const payment = await Payment.findOne({
        orderId: order.id,
        stripeId: stripeCharge!.id,
    });

    // check the payment if not null
    expect(payment).not.toBeNull();

    // ***TEST WITH MOCK***
    // // get the data
    // const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];

    // // expects
    // expect(chargeOptions.source).toEqual("tok_visa");
    // expect(chargeOptions.amount).toEqual(50 * 100);
    // expect(chargeOptions.currency).toEqual("usd");
});
