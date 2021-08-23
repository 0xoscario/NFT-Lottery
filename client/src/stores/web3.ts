import Web3 from "../models/Web3";
import { isSSR, setIntervalAsync } from "../utils";

const web3 = Web3.create();

if (!isSSR) {
  window.addEventListener("load", () => {
    web3.sync();
    // check every second for web3 changes
    setIntervalAsync(() => web3.sync(), 1e3);
  });
}

export default web3;
