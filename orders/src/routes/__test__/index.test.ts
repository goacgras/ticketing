import request from "supertest";
import { app } from "../../app";
import { Order } from "../../models/order";
import { Ticket } from "../../models/ticket";

it("fetches orders for particular user", async () => {
    //create 3 tickets
    //create 1 order as User #1
    //create 2 order as User #2
    //Make request to get orders from user
});
