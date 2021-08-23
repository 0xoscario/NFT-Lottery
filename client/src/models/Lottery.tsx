import { types } from "mobx-state-tree";
import Transaction from "./EnigmaTransaction";
import web3Store from "../stores/web3";
import { emptyAddress } from "../utils";

const Lottery = types
  .model("Lottery", {
    id: types.identifier,
    transaction: Transaction,
    token_id: types.maybe(types.string),
    token_name: types.maybe(types.string),
    token_symbol: types.maybe(types.string),
    token_image: types.maybe(types.string),
    participants: types.maybe(types.number),
    max_participants: types.maybe(types.number),
    contract_addr: types.maybe(types.string),
    winner: types.maybe(types.string),
    lotteryStatus: types.maybe(
      types.enumeration(["JOINING", "READY", "COMPLETE"])
    )
  })
  .views(self => ({
    get status(): "JOIN" | "LOGIN" | "FULL" | "WON" | "LOST" {
      const loggedIn = web3Store.isLoggedIn;
      const user = web3Store.account;
      const hasWinner = self.winner !== emptyAddress;
      const userIsWinner = self.winner === user;

      if (userIsWinner) {
        return "WON";
      } else if (hasWinner) {
        return "LOST";
      } else if (self.participants === self.max_participants) {
        return "FULL";
      } else if (!loggedIn) {
        return "LOGIN";
      } else {
        return "JOIN";
      }
    }
  }));

export default Lottery;
