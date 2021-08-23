import { types } from "mobx-state-tree";
import Transaction from "./Transaction";
import EnigmaTransaction from "./EnigmaTransaction";

const Step = types
  .model("Step", {
    type: types.enumeration(["WHITELIST", "DEPOSIT", "CREATE"]),
    transaction: types.union(Transaction, EnigmaTransaction),
    skipped: false
  })
  .actions(self => ({
    skip() {
      self.skipped = true;
    }
  }));

export default Step;
