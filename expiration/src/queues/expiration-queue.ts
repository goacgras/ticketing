import Queue from "bull";

// create a generic interface
interface Payload {
    orderId: string;
}

// create a queue that is going to send to redis
const expirationQueue = new Queue<Payload>("order:expiration", {
    redis: {
        host: process.env.REDIS_HOST,
    },
});

// what to do after finish the job
expirationQueue.process(async (job) => {
    console.log(
        "I want to publish an expiration:complete event for orderId",
        job.data.orderId
    );
});

export { expirationQueue };
