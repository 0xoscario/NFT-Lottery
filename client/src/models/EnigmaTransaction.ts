/*
  A model to keep track of a transaction
*/
import { types, flow } from "mobx-state-tree";
import { utils, eeConstants } from "enigma-js/node";
import { sleep } from "../utils";

interface ITransactionArgs {
  fn: string;
  args: any;
  userAddr: string;
  contractAddr: string;
}

const computeTask = (
  enigma: any,
  { fn, args, userAddr, contractAddr }: ITransactionArgs
) => {
  return new Promise((resolve, reject) => {
    enigma
      .computeTask(
        fn,
        args,
        10000000,
        utils.toGrains(1),
        userAddr,
        contractAddr
      )
      .on(eeConstants.SEND_TASK_INPUT_RESULT, task => resolve(task))
      .on(eeConstants.ERROR, error => reject(error));
  });
};

const updateTaskRecordStatus = (enigma: any, task: any) => {
  return enigma.getTaskRecordStatus(task);
};

const getTaskResult = (enigma: any, task: any) => {
  return new Promise((resolve, reject) => {
    enigma
      .getTaskResult(task)
      .on(eeConstants.GET_TASK_RESULT_RESULT, task => resolve(task))
      .on(eeConstants.ERROR, error => reject(error));
  });
};

const EnigmaTransaction = types
  .model("EnigmaTransaction", {
    status: types.optional(
      types.enumeration(["EMPTY", "PENDING", "SUCCESS", "FAILURE"]),
      "EMPTY"
    ),
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
      self.error = undefined;
    }
  }))
  .actions(self => ({
    run: flow(function*(enigma: any, txArgs: ITransactionArgs) {
      self.reset();

      self.update({
        status: "PENDING"
      });

      try {
        let task: any = yield computeTask(enigma, txArgs);

        while (task.ethStatus !== 2) {
          if (task.ethStatus === 3 || task.ethStatus === 4) {
            throw Error("failed");
          }

          yield sleep(1000);
          task = yield updateTaskRecordStatus(enigma, task);
        }

        const result = yield getTaskResult(enigma, task);

        self.update({
          status: "SUCCESS"
        });

        return enigma.decryptTaskResult(result);
      } catch (err) {
        console.error(err);

        self.update({
          status: "FAILURE",
          error: err.message
        });
      }
    })
  }));

export default EnigmaTransaction;
