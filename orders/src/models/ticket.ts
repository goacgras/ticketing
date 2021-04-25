import mongoose from "mongoose";
import { Order, OrderStatus } from "./order";

//ticket attributes
interface TicketAttrs {
    title: string;
    price: number;
}

//instances
export interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    //create a method in TicketDoc
    isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
            },
        },
    }
);

//statics is how we add new method directly to TicketModel it self
ticketSchema.statics.build = (attrs: TicketAttrs) => {
    return new Ticket(attrs);
};

// add new method to TicketDocument
// => await ticket.isReserved()
//use function() because we want to access this keyword
ticketSchema.methods.isReserved = async function () {
    //this === is the "ticket" document that we just called 'isReserved' on
    //meaning => ticket.isReserved

    //Run query to look all orders. Find an order where the ticket,
    //is the ticket we just found *and* the order status is *not* cancelled
    //if we find an order from that means the ticket *is* reserved
    //meaning: find order with status below, if we found, user cant attempt to reserved
    const existingOrder = await Order.findOne({
        ticket: this,
        status: {
            $in: [
                OrderStatus.Created,
                OrderStatus.Complete,
                OrderStatus.AwaitingPayment,
            ],
        },
    });

    return !!existingOrder;
};

const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", ticketSchema);

export { Ticket };
