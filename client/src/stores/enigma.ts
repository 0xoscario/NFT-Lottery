import { reaction } from "mobx";
import Enigma from "../models/Enigma";
import web3Store from "./web3";
import { isSSR } from "../utils";

const enigma = Enigma.create();

if (!isSSR) {
  window.addEventListener("load", () => {
    // if account changes, reinitialize enigma
    reaction(
      () => web3Store.account,
      () => {
        enigma.init().catch(console.error);
      }
    );
  });
}

export default enigma;
