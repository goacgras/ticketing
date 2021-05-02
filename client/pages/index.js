// import buildClient from "../api/build-client";

const Home = ({ currentUser }) => {
    return <h1>{currentUser ? "You are sign in" : "You are NOT sign in"}</h1>;
};

// we're passing currentUser property from _app and passes down to child component
Home.getInitialProps = async (context, client, currentUser) => {
    return {};

    // const client = buildClient(context);
    // const { data } = await client.get("/api/users/currentuser");
    // return data;
};

export default Home;
