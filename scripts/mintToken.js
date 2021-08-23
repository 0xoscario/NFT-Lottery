const ERC721 = require("../build/smart_contracts/NFT.json");

const [, , , , address, id] = process.argv;

if (typeof address === "undefined") {
  throw Error("address not provided");
}
if (typeof id === "undefined") {
  throw Error("id not provided");
}

const mintToken = async cb => {
  const [owner] = await web3.eth.getAccounts();

  const erc721 = new web3.eth.Contract(ERC721.abi, address);

  await erc721.methods
    .mint(owner, id)
    .send({
      from: owner,
      gas: 5000000,
      gasPrice: "1"
    })
    .catch(console.error);

  cb(
    JSON.stringify(
      {
        token: id
      },
      null,
      2
    )
  );
};

module.exports = mintToken;
