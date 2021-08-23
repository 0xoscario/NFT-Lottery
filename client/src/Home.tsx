import { when } from "mobx";
import { observer } from "mobx-react";
import web3Store from "./stores/web3";
import store from "./stores/home";
import Lottery from "./components/Lottery";

when(
  () => web3Store.isLoggedIn,
  () => {
    store.getLotteries();
  }
);

const Home = observer(() => {
  const lotteries = Array.from(store.lotteries.values());

  return (
    <div className="container">
      <div className="title">
        {/* <p>
          Encrypted NFT lotteries using the{" "}
          <a href="https://enigma.co/">Enigma Protocol</a>
        </p> */}
        <p>Encrypted Non-Fungible Token (NFT) Lottery</p>
      </div>
      <div className="lotteries">
        {lotteries.length === 0 ? (
          <h1>no lotteries available</h1>
        ) : (
          lotteries.map(lottery => {
            return <Lottery key={lottery.id} store={lottery} />;
          })
        )}
      </div>
      <style jsx>{`
        h1{
          text-align: center;
          justify-content: center;
          width: 100vw;
          align-items: center;
          display: flex;
          height: 58vh;
        }
        .lotteries {
          flex-wrap: wrap;
          display: flex;
          justify-content: space-between;
          margin-left: 2vw;
          margin-right: 2vw; 
        }
        a {
          color: #e72a9b;
          text-decoration: none;
        }
        .title {
          display: flex;
          justify-content: center;
          margin-top: 3vh;
          margin-bottom: 2vh:
        }
        .container {
          display: flex;
          flex-direction: column;
          margin: none;
          color: white;
          padding-left: 10vh;
          padding-right: 10vh;
          padding-top: 0;
          padding-bottom: 0;
        }
        .header {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1vh;
        }
      `}</style>
    </div>
  );
});

export default Home;
