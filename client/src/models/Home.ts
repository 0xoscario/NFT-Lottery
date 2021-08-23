import { types, flow } from "mobx-state-tree";
import Lottery from "./Lottery";
import web3Store from "../stores/web3";

const Home = types
  .model("Home", {
    lotteries: types.map(Lottery)
  })
  .actions(self => ({
    getLotteries: flow(function* getLotteries() {
      const deposit: any = yield web3Store.getContract("Deposit");

      const length = yield deposit.methods
        .lotteriesLength()
        .call({
          from: web3Store.account
        })
        .then(res => {
          if (!res) return 0;

          return Number(res.toString());
        });

      const lotteries: any[] = yield Promise.all(
        Array.from(Array(length)).map(async (v, i) => {
          const lottery = await deposit.methods.lotteries(i + 1).call();
          const nft = await web3Store.getContract("NFT", lottery.contract_addr);
          const [token_name, token_symbol, token_image] = await Promise.all([
            nft.methods.name().call(),
            nft.methods.symbol().call(),
            nft.methods.tokenURI(lottery.token_id).call()
          ]);

          lottery.lotteryStatusN = lottery.status;
          delete lottery.status;

          return {
            ...lottery,
            token_name,
            token_symbol,
            token_image
          };
        })
      );

      console.log({ length, lotteries });

      self.lotteries.clear();

      lotteries.forEach(lottery => {
        self.lotteries.set(lottery.id, {
          transaction: {},
          ...lottery,
          participants: Number(lottery.participants),
          max_participants: Number(lottery.max_participants),
          lotteryStatus:
            lottery.lotteryStatusN === "0"
              ? "JOINING"
              : lottery.lotteryStatusN === "1"
              ? "READY"
              : "COMPLETE"
        });
      });
    })
  }));

export default Home;
