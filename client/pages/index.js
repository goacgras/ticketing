// import buildClient from "../api/build-client";
// we're passing currentUser property from _app and passes down to child component
const Home = ({ currentUser, tickets }) => {
    const ticketList = tickets.map((ticket) => (
        <tr key={ticket.id}>
            <td>{ticket.title}</td>
            <td>${ticket.price}</td>
        </tr>
    ));

    return (
        <div>
            <h1>Tickets</h1>
            <table className='table'>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>{ticketList}</tbody>
            </table>
        </div>
    );
};

Home.getInitialProps = async (context, client, currentUser) => {
    const { data } = await client.get("/api/tickets");

    return {
        tickets: data,
    };
};

export default Home;
