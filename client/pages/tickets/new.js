import { useState } from "react";
import { useRequest } from "../../hooks/useRequest";
import Router from "next/router";
const NewTicket = () => {
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");

    const { doRequest, errors } = useRequest({
        url: "/api/tickets",
        method: "post",
        body: {
            title,
            price,
        },
        onSuccess: () => Router.push("/"),
    });

    const onBlur = () => {
        const value = parseFloat(price);

        isNaN(value) ? null : setPrice(value.toFixed(2));

        // if(isNaN(value)){
        //     return
        // }

        // setPrice(value.toFixed(2))
    };

    const onSubmit = (event) => {
        event.preventDefault();
        doRequest();
    };

    return (
        <div>
            <h1>Create Ticket</h1>
            <form onSubmit={onSubmit}>
                <div className='form-group'>
                    <label>Title</label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className='form-control'
                    />
                </div>
                <div className='form-group'>
                    <label>Price</label>
                    <input
                        value={price}
                        // when user click out
                        onBlur={onBlur}
                        onChange={(e) => setPrice(e.target.value)}
                        className='form-control'
                    />
                </div>
                {errors}
                <button className='btn btn-primary'>Submit</button>
            </form>
        </div>
    );
};

export default NewTicket;