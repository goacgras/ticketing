import { useState } from "react";
import { useRequest } from "../../hooks/useRequest";
import Router from "next/router";

const Signin = () => {
    // const router = useRouter()
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { doRequest, errors } = useRequest({
        url: "/api/users/signin",
        method: "post",
        body: {
            email,
            password,
        },
        onSuccess: () => Router.push("/"),
    });

    const submitForm = async (e) => {
        e.preventDefault();
        await doRequest();
        setEmail("");
        setPassword("");
    };

    return (
        <form onSubmit={submitForm}>
            <h1>Signin</h1>
            <div className='form-group'>
                <label>Email Address</label>
                <input
                    type='email'
                    className='form-control'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className='form-group'>
                <label>Password</label>
                <input
                    type='password'
                    className='form-control'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            {errors}

            <button className='btn btn-primary'>Sign in</button>
        </form>
    );
};

export default Signin;
