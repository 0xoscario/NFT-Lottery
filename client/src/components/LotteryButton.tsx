import { CSSProperties } from "react";
import { Instance } from "mobx-state-tree";
import Button from "./Button";
import LotteryModel from "../models/Lottery";

type IButton = Parameters<typeof Button>[0];

interface ILotteryButton extends IButton {
  status: Instance<typeof LotteryModel>["status"];
}

const getText = (status: ILotteryButton["status"]) => {
  if (status === "JOIN") {
    return "JOIN";
  }
  if (status === "LOGIN") {
    return "LOGIN";
  }
  if (status === "FULL") {
    return "ROLL";
  }
  if (status === "WON") {
    return "WON! 🎉";
  }
  if (status === "LOST") {
    return "LOST 😔";
  }

  throw Error("should't be here");
};

const getStyle = (disabled: boolean): CSSProperties => {
  const backgroundColor = disabled ? "grey" : "#e72a9b";
  const width = "12vh";

  return {
    backgroundColor,
    width
  };
};

const LotteryButton = ({
  status,
  onClick,
  loading,
  disabled,
  undertext
}: ILotteryButton) => {
  const shouldBeEnabled: string[] = ["JOIN", "FULL"];
  disabled = disabled || !shouldBeEnabled.includes(status);

  return (
    <Button
      style={getStyle(disabled)}
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      undertext={undertext}
    >
      {getText(status)}
    </Button>
  );
};

export default LotteryButton;
