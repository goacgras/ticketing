import Link from "next/link";

// we're passing currentUser property from _app and passes down to child component
const Home = ({ currentUser, tickets }) => {
    const ticketList = tickets.map((ticket) => (
        <tr key={ticket.id}>
            <td>{ticket.title}</td>
            <td>${ticket.price}</td>
            <td>
                <Link href={`/tickets/${ticket.id}`}>
                    <a>View</a>
                </Link>
            </td>
        </tr>
    ));

    return (
        <div>
            <h2>Tickets</h2>
            <table className='table'>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Link</th>
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
