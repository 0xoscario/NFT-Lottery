import { observer } from "mobx-react";
import WhitelistAddresses from "./components/WhitelistAddresses";
import DepositToken from "./components/DepositToken";
import CreateLottery from "./components/CreateLottery";
import Complete from "./components/Complete";
import ProgressBar from "./components/ProgressBar";
import CreateModel from "./models/Create";

const store = CreateModel.create();

const Create = observer(() => {
  const statusId =
    (() => {
      if (!store.currentStep) return 0;

      return store.steps.findIndex(step => {
        return step.type === store.currentStep.type;
      });
    })() + 1;

  const View = () => {
    if (!store.currentStep) return <Complete />;

    if (store.currentStep.type === "WHITELIST") {
      return <WhitelistAddresses step={store.currentStep} />;
    } else if (store.currentStep.type === "DEPOSIT") {
      return <DepositToken step={store.currentStep} />;
    } else {
      return <CreateLottery step={store.currentStep} />;
    }
  };

  return (
    <div className="container">
      <ProgressBar status={statusId as any} />
      <View />

      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          padding-left: 10vh;
          padding-right: 10vh;
          padding-top: 0;
          padding-bottom: 0;
          flex: 1;
          justify-content: center;
        }
        .circle {
          background-color: #003e86;
          border-radius: 50%;
          width: 5vh;
          height: 5vh;
          line-height: 5vh;
          text-align: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
});

export default Create;
