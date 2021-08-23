import { observer } from "mobx-react";
import { types, unprotect, Instance } from "mobx-state-tree";
import Button from "./Button";
import TextInput from "./TextInput";
import Step from "../models/Step";
import web3Store from "../stores/web3";
import Transaction from "../models/Transaction";

interface IDepositToken {
  step: Instance<typeof Step>;
}

const store = types
  .model("DepositToken", {
    address: "",
    tokenId: types.maybe(types.number)
  })
  .create();
unprotect(store);

const Go = (step: IDepositToken["step"]) => async () => {
  const deposit = await web3Store.getContract("Deposit");
  const nftContract = await web3Store.getContract("NFT", store.address);
  const transaction = step.transaction as Instance<typeof Transaction>;

  return transaction.run(() => {
    return nftContract.methods
      .approve(deposit.options.address, store.tokenId)
      .send({
        from: web3Store.account
      });
  });
};

const DepositToken = observer(({ step }: IDepositToken) => {
  const loading = step.transaction.status === "PENDING";
  const disabled = loading || !store.address || !store.tokenId;
  const errorMsg = step.transaction.error;
  const error = errorMsg ? `error: ${errorMsg}` : null;

  return (
    <div className="container">
      <div className="title">
        <span className="main">Approve token so it can be deposited</span>
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
        <div className="buttons">
          <Button
            onClick={Go(step)}
            disabled={disabled}
            loading={loading}
            undertext={step.transaction.error}
          >
            Next
          </Button>
          <Button onClick={step.skip} disabled={loading}>
            Skip
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

export default DepositToken;
