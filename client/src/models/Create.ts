import { types, flow } from "mobx-state-tree";
import Transaction from "./Transaction";
import EnigmaTransaction from "./EnigmaTransaction";
import Step from "./Step";

const Create = types
  .model("Create", {
    steps: types.array(Step)
  })
  .views(self => ({
    get currentStep() {
      return self.steps.find(step => {
        return !step.skipped && step.transaction.status !== "SUCCESS";
      });
    }
  }))
  .actions(self => ({
    afterCreate() {
      self.steps.replace([
        Step.create({
          type: "WHITELIST",
          transaction: EnigmaTransaction.create()
        }),
        Step.create({
          type: "DEPOSIT",
          transaction: Transaction.create()
        }),
        Step.create({
          type: "CREATE",
          transaction: EnigmaTransaction.create()
        })
      ]);
    }
  }));

export default Create;
