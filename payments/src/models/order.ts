import { OrderStatus } from "@grasticketing/common";
import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

// list properties we need to provide to build an order
interface OrderAttrs {
    id: string;
    version: number;
    userId: string;
    price: number;
    status: OrderStatus;
}

// list properties that order has
interface OrderDoc extends mongoose.Document {
    version: number;
    userId: string;
    price: number;
    status: OrderStatus;
}

// list of the properties that model contains
interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs: OrderAttrs): OrderDoc;
    findByEvent(event: {
        id: string;
        version: number;
    }): Promise<OrderDoc | null>;
}

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            required: true,
            enum: Object.values(OrderStatus),
        },
    },
    {
        // when we send json it will provide appropriate
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
            },
        },
    }
);

// override __v to version
orderSchema.set("versionKey", "version");

// auto increment
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => {
    return new Order({
        _id: attrs.id,
        version: attrs.version,
        price: attrs.price,
        userId: attrs.userId,
        status: attrs.status,
    });
};

orderSchema.statics.findByEvent = (event: { id: string; version: number }) => {
    return Order.findOne({
        _id: event.id,
        version: event.version - 1,
    });
};

const Order = mongoose.model<OrderDoc, OrderModel>("Order", orderSchema);

export { Order };
