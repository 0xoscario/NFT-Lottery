import Head from "next/head";
import Header from "../src/components/Header";

interface IAppProps {
  View: () => JSX.Element;
  path: string;
}

const App = ({ View, path }: IAppProps) => {
  return (
    <>
      <Head>
        <title>Private & Secure Lottery</title>
        <meta name="Description" content="Join ERC721 lotteries privately" />
        <link
          href="https://fonts.googleapis.com/css?family=Roboto&display=swap"
          rel="stylesheet"
          key="google-font-cabin"
        />
      </Head>

      <Header path={path} />
      <View />

      <style jsx global>{`
        body {
          background-color: #001c3d;
          display: flex;
          justify-content: center;
          align-items: center;
          margin: none;
          padding: none;
          font-family: "Roboto", sans-serif;
        }

        #__next {
          width: 100vw;
        }
      `}</style>
    </>
  );
};

export default App;
