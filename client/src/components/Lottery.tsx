import { observer } from "mobx-react";
import { Instance } from "mobx-state-tree";
import LotteryButton from "./LotteryButton";
import LotteryModel from "../models/Lottery";
import web3Store from "../stores/web3";
import enigmaStore from "../stores/enigma";

interface ILottery {
  store: Instance<typeof LotteryModel>;
}

const Go = (store: ILottery["store"]) => async () => {
  const enigma = enigmaStore.getEnigma();

  if (store.status === "JOIN") {
    return store.transaction.run(enigma, {
      fn: "join_lottery(uint256, address)",
      args: [[store.token_id, "uint256"], [web3Store.account, "address"]],
      userAddr: web3Store.account,
      contractAddr: enigmaStore.enigmaContractAddress
    });
  }

  // full
  return store.transaction.run(enigma, {
    fn: "roll(uint256)",
    args: [[store.token_id, "uint256"]],
    userAddr: web3Store.account,
    contractAddr: enigmaStore.enigmaContractAddress
  });
};

const Lottery = observer(({ store }: ILottery) => {
  const loading = store.transaction.status === "PENDING";
  const disabled = !enigmaStore.isInstalled || loading;

  return (
    <div className="lottery">
      <div className="left">
        <div className="top">
          <div className="title">{store.token_name}</div>
          <div className="tokenId">Token Id: {store.token_id}</div>
          <div className="participants">
            Participants: {`${store.participants}/${store.max_participants}`}
          </div>
        </div>
        <div className="bottom">
          <LotteryButton
            status={store.status}
            disabled={disabled}
            loading={loading}
            onClick={Go(store)}
            undertext={store.transaction.error}
          />
        </div>
      </div>
      <div className="right">
        <img
          className="center"
          src={store.token_image}
          alt={store.token_id}
          width="100vw"
        />
      </div>

      <style jsx>{`
        .lottery {
          font-size: 2.5vh;
          display: flex;
          height: 25vh;
          width: 37vw;
          background-color: #003e86;
          border-radius: 15px;
          color: white;
          margin: 2vh;
          margin-top: 4vh;
          margin-bottom: 4vh;
          box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
        }
        .left {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          flex: 1;
          margin-left: 2vh;
          margin-right: 2vh;
          margin-top: 2vh;
          margin-bottom: 2vh;
          border-right: 1px solid #001c3d;
        }
        .right {
          justify-content: center;
          align-items: center;
          flex: 1;
        }
        .top {
          display: flex;
          flex-direction: column;
          justify-content: space-around;
        }
        .bottom {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .title {
          font-size: 3.5vh;
        }
        .center {
          display: block;
          margin-left: auto;
          margin-right: auto;
          margin-top: 3.5vh;
          margin-bottom: 3.5vh;
          width: 50%;
        }
      `}</style>
    </div>
  );
});

export default Lottery;
