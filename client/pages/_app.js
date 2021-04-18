import "bootstrap/dist/css/bootstrap.css";
import BuildClient from "../api/build-client";
import { Header } from "../components/header";

const AppComponent = ({ Component, pageProps, currentUser }) => {
    return (
        <div>
            <Header currentUser={currentUser} />
            <Component {...pageProps} />
        </div>
    );
};

AppComponent.getInitialProps = async (appContext) => {
    const client = BuildClient(appContext.ctx);
    const { data } = await client.get("/api/users/currentuser");

    let pageProps = {};

    //if a pages has getinitial props, use that!
    if (appContext.Component.getInitialProps) {
        //get initial props in pages below nested in appContext.Component
        pageProps = await appContext.Component.getInitialProps(appContext.ctx);
    }

    return {
        pageProps,
        ...data,
    };
};

export default AppComponent;
