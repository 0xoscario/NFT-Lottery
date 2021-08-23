const ERC721 = require("../build/smart_contracts/NFT.json");

const [, , , , name, symbol] = process.argv;

if (typeof name === "undefined") {
  throw Error("name not provided");
}
if (typeof symbol === "undefined") {
  throw Error("symbol not provided");
}

const createERC721 = async cb => {
  const [owner] = await web3.eth.getAccounts();

  const Erc721Contract = new web3.eth.Contract(ERC721.abi, {
    data: ERC721.bytecode
  });

  const erc721 = await Erc721Contract.deploy({
    arguments: [name, symbol]
  })
    .send({
      from: owner,
      gas: 5000000,
      gasPrice: "1"
    })
    .then(newContractInstance => {
      return newContractInstance;
    })
    .catch(console.error);

  cb(
    JSON.stringify(
      {
        erc721: erc721.options.address
      },
      null,
      2
    )
  );
};

module.exports = createERC721;
