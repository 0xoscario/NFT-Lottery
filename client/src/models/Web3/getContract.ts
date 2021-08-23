import Web3 from "web3";

const definitions = {
  NFT: undefined,
  Deposit: undefined
};

const getContract = async (
  web3: Web3,
  name: keyof typeof definitions,
  {
    networkId,
    address
  }: {
    networkId: number;
    address?: string;
  }
) => {
  const definition =
    definitions[name] ||
    (await import(`../../../../build/smart_contracts/${name}.json`).then(
      d => d.default
    ));

  definitions[name] = definition;

  if (!definition.networks[networkId]) {
    throw Error("contract address not found in this network");
  }

  const contract = new web3.eth.Contract(
    definition.abi,
    address ? address : definition.networks[networkId].address
  );

  return contract;
};

export default getContract;
