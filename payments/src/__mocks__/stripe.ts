export const stripe = {
    charges: {
        create: jest
            .fn()
            // promise
            .mockResolvedValue({}),
    },
};
