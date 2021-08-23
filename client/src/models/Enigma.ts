/*
  A store to initialize enigma.
*/
import { types, flow } from "mobx-state-tree";
import web3Store from "../stores/web3";
import { isSSR } from "../utils";
import * as env from "../env";

const Model = types
  .model("Enigma", {
    isInstalled: types.maybeNull(types.boolean),
    enigmaAddress: types.maybeNull(types.string),
    enigmaTokenAddress: types.maybeNull(types.string),
    enigmaContractAddress: types.maybeNull(types.string)
  })
  .actions(self => {
    let enigma: any | undefined;

    return {
      _getEnigma() {
        return enigma;
      },
      getEnigma() {
        if (!enigma) {
          throw Error("enigma not initialized");
        }

        return enigma;
      },
      setEnigma(_enigma: any) {
        enigma = _enigma;
      }
    };
  })
  .actions(self => ({
    init: flow(function*() {
      if (isSSR) return;
      if (!web3Store.isLoggedIn) return;
      const web3 = web3Store.getWeb3();

      // dynamically load enigma-js and contract definitions
      const [Enigma, EnigmaContract, EnigmaTokenContract] = (yield Promise.all([
        import("enigma-js").then(d => d.Enigma),
        import("../../../build/enigma_contracts/EnigmaSimulation.json").then(
          d => d.default
        ),
        import("../../../build/enigma_contracts/EnigmaToken.json").then(
          d => d.default
        )
      ])) as any[];

      if (
        !EnigmaContract.networks[web3Store.networkId] ||
        !EnigmaTokenContract.networks[web3Store.networkId]
      ) {
        throw Error("contract address not found in this network");
      }

      self.enigmaAddress = EnigmaContract.networks[web3Store.networkId].address;
      self.enigmaTokenAddress =
        EnigmaTokenContract.networks[web3Store.networkId].address;
      self.enigmaContractAddress = env.enigmaContractAddress;

      const enigma = new Enigma(
        web3,
        self.enigmaAddress,
        self.enigmaTokenAddress,
        env.enigmaUrl,
        {
          gas: 4712388,
          gasPrice: 100000000000,
          from: web3Store.account
        }
      );

      enigma.admin();

      self.setEnigma(enigma);

      self.isInstalled = true;
      console.log("Enigma Initialized");
    })
  }));

export default Model;
