import { observer } from "mobx-react";
import { types, unprotect, Instance } from "mobx-state-tree";
import Button from "./Button";
import Step from "../models/Step";
import web3Store from "../stores/web3";
import enigmaStore from "../stores/enigma";
import EnigmaTransaction from "../models/EnigmaTransaction";

interface IWhitelistAddresses {
  step: Instance<typeof Step>;
}

const store = types
  .model("WhitelistAddresses", {
    invalidInput: false,
    addresses: types.maybe(types.string)
  })
  .create();
unprotect(store);

const Go = (step: IWhitelistAddresses["step"]) => async () => {
  const enigma = enigmaStore.getEnigma();
  const addresses = store.addresses.split("\n");
  const transaction = step.transaction as Instance<typeof EnigmaTransaction>;

  return transaction.run(enigma, {
    fn: "add_to_whitelist(address[], address)",
    args: [[addresses, "address[]"], [web3Store.account, "address"]],
    userAddr: web3Store.account,
    contractAddr: enigmaStore.enigmaContractAddress
  });
};

const updateAddresses = e => {
  const web3 = web3Store.getWeb3();
  const value: string = e.target.value || "";
  const addresses = value.split("\n");
  const isOk = addresses.every(address => web3.utils.isAddress(address));

  store.invalidInput = !isOk;
  store.addresses = value;
};

const WhitelistAddresses = observer(({ step }: IWhitelistAddresses) => {
  const loading = step.transaction.status === "PENDING";
  const disabled =
    !enigmaStore.isInstalled ||
    loading ||
    store.invalidInput ||
    !store.addresses;
  const errorMsg = step.transaction.error;
  const error = errorMsg ? `error: ${errorMsg}` : null;

  return (
    <div className="container">
      <div className="title">
        <span className="main">
          Add addresses that can participate in the lotteries
        </span>
        <span className="secondary">
          (secret contract owner only, one address per line, up to 100)
        </span>
      </div>
      <div className="form">
        <textarea onChange={updateAddresses} value={store.addresses} />
        <div className="buttons">
          <Button onClick={Go(step)} disabled={disabled} loading={loading}>
            Next
          </Button>
          <Button onClick={step.skip} disabled={loading}>
            Skip
          </Button>
        </div>
      </div>
      <div className="error">{error ? <span>{error}</span> : null}</div>

      <style jsx>{`
        textarea {
          width: 70vh;
          height: 25vh;
          border-radius: 15px;
          margin-top: 2vh;
          border: ${error ? "1px solid red" : "none"};
        }

        .container {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          height: 55vh;
          color: white;
        }

        .form {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          height: 40vh;
          color: white;
        }

        .title {
          display: flex;
          flex-direction: column;
          text-align: center;
        }
        .title > .main {
          font-size: 3vh;
        }

        .buttons {
          display: flex;
          flex-direction: row;
        }

        .error {
          height: 50px;
        }
      `}</style>
    </div>
  );
});

export default WhitelistAddresses;
