import { types } from "mobx-state-tree";
import { Transaction as TransactionType } from "web3/eth/types";
import { TransactionReceipt } from "web3/types";
import web3Store from "../stores/web3";
import { sleep } from "../utils";

const Transaction = types
  .model("Transaction", {
    status: types.optional(
      types.enumeration(["EMPTY", "PENDING", "SUCCESS", "FAILURE"]),
      "EMPTY"
    ),
    hash: types.maybe(types.string),
    error: types.maybe(types.string)
  })
  .actions(self => ({
    update(updates: Partial<typeof self>) {
      for (let key in updates) {
        self[key] = updates[key];
      }
    },

    reset() {
      self.status = "EMPTY";
      self.hash = undefined;
      self.error = undefined;
    }
  }))
  .actions(self => ({
    run(fn: () => Promise<any>) {
      const web3 = web3Store.getWeb3();

      self.reset();

      self.update({
        status: "PENDING"
      });

      return new Promise<string | undefined>(async resolve => {
        try {
          const tx = await fn();
          const hash = tx.transactionHash;

          self.update({
            hash
          });

          let receipt: TransactionReceipt | null = null;
          while (
            (receipt = await web3.eth.getTransactionReceipt(hash)) === null
          ) {
            console.log({ receipt, hash: hash });
            await sleep(1000);
          }

          if (!receipt.status) {
            throw Error("tx reverted");
          }

          self.update({
            status: "SUCCESS"
          });

          resolve(hash);
        } catch (err) {
          console.error(err);

          self.update({
            status: "FAILURE",
            error: err.message
          });

          resolve(undefined);
        }
      });
    }
  }));

export default Transaction;
