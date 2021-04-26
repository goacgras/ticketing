import { Ticket } from "../ticket";

it("implements optimistic concurrency control", async () => {
    // create an instance of ticket
    const ticket = Ticket.build({
        title: "test ticket",
        price: 50,
        userId: "123",
    });

    // save the ticket to db
    await ticket.save();

    // fetch the ticket twice
    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);

    // make two seprate change to the tickets we fetch
    firstInstance!.set({ price: 30 });
    secondInstance!.set({ price: 800 });

    // save the first fetch ticket
    await firstInstance!.save();

    // save the second fetch ticket and expect an error
    await expect(secondInstance!.save()).rejects.toThrow();
});
