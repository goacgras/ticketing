import "bootstrap/dist/css/bootstrap.css";
import BuildClient from "../api/build-client";
import { Header } from "../components/header";

const AppComponent = ({ Component, pageProps, currentUser }) => {
    return (
        <div>
            <Header currentUser={currentUser} />
            <div className='container'>
                <Component currentUser={currentUser} {...pageProps} />
            </div>
        </div>
    );
};

AppComponent.getInitialProps = async (appContext) => {
    const client = BuildClient(appContext.ctx);
    const { data } = await client.get("/api/users/currentuser");

    let pageProps = {};

    //if a child component has getinitial props, use that!
    if (appContext.Component.getInitialProps) {
        //get initial props in pages below nested in appContext.Component
        // we are passing the context, client & currentUser to child's component getInitialProps
        pageProps = await appContext.Component.getInitialProps(
            appContext.ctx,
            client,
            data.currentUser
        );
    }

    // get the pageProps and pass down into child component above
    return {
        pageProps,
        ...data,
    };
};

export default AppComponent;
