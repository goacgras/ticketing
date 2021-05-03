import { useEffect, useState } from "react";
import StripeCheckout from "react-stripe-checkout";
import { useRequest } from "../../hooks/useRequest";

const OrderShow = ({ order, currentUser }) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const { doRequest, errors } = useRequest({
        url: "/api/payments",
        method: "post",
        body: {
            orderId: order.id,
        },
        onSuccess: (payment) => console.log(payment),
    });

    useEffect(() => {
        const findTimeLeft = () => {
            const msLeft = new Date(order.expiresAt) - new Date();
            setTimeLeft(Math.round(msLeft / 1000));
        };

        findTimeLeft();
        const timerId = setInterval(findTimeLeft, 1000);

        // clean up fn
        return () => {
            clearInterval(timerId);
        };
    }, []);

    if (timeLeft < 0) return <div>Order has Expired</div>;

    return (
        <div>
            time left to pay: {timeLeft} seconds
            <StripeCheckout
                token={({ id }) => doRequest({ token: id })}
                stripeKey='pk_test_51IlxhPHTEyf9YdIFTq7brcRAuF4bfChIePlPZVWjNlKkgtFBeDLjAXA2uhKQJ4c7ZJ18OtdvUTJdrrJp5doDm7Bc00cf7oaVid'
                amount={order.ticket.price * 100}
                email={currentUser.email}
            />
            {errors}
        </div>
    );
};

OrderShow.getInitialProps = async (context, client) => {
    // wildcard route
    const { orderId } = context.query;
    const { data } = await client.get(`/api/orders/${orderId}`);

    return {
        order: data,
    };
};

export default OrderShow;
