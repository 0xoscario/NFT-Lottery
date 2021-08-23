import { observer } from "mobx-react";
import { types, unprotect, Instance } from "mobx-state-tree";
import Button from "./Button";
import TextInput from "./TextInput";
import Step from "../models/Step";
import homeStore from "../stores/home";
import web3Store from "../stores/web3";
import enigmaStore from "../stores/enigma";
import EnigmaTransaction from "../models/EnigmaTransaction";

interface ICreateLottery {
  step: Instance<typeof Step>;
}

const store = types
  .model("CreateLottery", {
    address: "",
    tokenId: types.maybe(types.number),
    maxParticipants: 5
  })
  .create();
unprotect(store);

const Go = (step: ICreateLottery["step"]) => async () => {
  const enigma = enigmaStore.getEnigma();
  const transaction = step.transaction as Instance<typeof EnigmaTransaction>;

  return transaction.run(enigma, {
    fn: "create_lottery(address, uint256, uint256, address)",
    args: [
      [store.address, "address"],
      [store.tokenId, "uint256"],
      [store.maxParticipants, "uint256"],
      [web3Store.account, "address"]
    ],
    userAddr: web3Store.account,
    contractAddr: enigmaStore.enigmaContractAddress
  });
};

const CreateLottery = observer(({ step }: ICreateLottery) => {
  const loading = step.transaction.status === "PENDING";
  const disabled =
    loading || !store.address || !store.tokenId || store.maxParticipants <= 1;
  const errorMsg = step.transaction.error;
  const error = errorMsg ? `error: ${errorMsg}` : null;

  return (
    <div className="container">
      <div className="title">
        <span className="main">Create Lottery</span>
      </div>
      <div className="form">
        <TextInput
          label="NFT Address:"
          onChange={e => (store.address = e.target.value)}
          value={store.address}
        />
        <TextInput
          label="Token ID:"
          type="number"
          onChange={e => (store.tokenId = Number(e.target.value))}
          value={String(store.tokenId)}
        />
        <TextInput
          label="Max Paticipants:"
          type="number"
          onChange={e => (store.maxParticipants = Number(e.target.value))}
          value={String(store.maxParticipants)}
        />
        <div className="buttons">
          <Button
            onClick={() => Go(step)().then(() => homeStore.getLotteries())}
            disabled={disabled}
            loading={loading}
            undertext={step.transaction.error}
          >
            Create
          </Button>
        </div>
      </div>
      <div className="error">{error ? <span>{error}</span> : null}</div>

      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          min-height: 55vh;
          color: white;
        }

        .form {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          min-height: 50vh;
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

export default CreateLottery;
