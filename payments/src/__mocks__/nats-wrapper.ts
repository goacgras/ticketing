//create a fakse nats wrapper based on new Route => TicketCreatedPublisher
//TicketCreatedPublisher's argument is natsWrapper.client.publish
//Inside base-publisher publish method has subject, data, callback arguments
//So after publish we directly call callback func so overall promise got resolve
export const natsWrapper = {
    client: {
        // publish: (subject: string, data: string, callback: () => void) => {
        //     callback();
        // },
        publish: jest
            .fn()
            .mockImplementation(
                (subject: string, data: string, callback: () => void) => {
                    callback();
                }
            ),
    },
};
