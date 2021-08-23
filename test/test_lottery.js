const fs = require("fs");
const Web3 = require("web3");
const { Enigma, utils, eeConstants } = require("enigma-js/node");
const DepositContract = artifacts.require("Deposit");
const NFTContract = artifacts.require("NFT");

const provider = new Web3.providers.HttpProvider("http://localhost:9545");
const web3 = new Web3(provider);

var EnigmaContract;
if (
  typeof process.env.SGX_MODE === "undefined" ||
  (process.env.SGX_MODE != "SW" && process.env.SGX_MODE != "HW")
) {
  console.log(`Error reading ".env" file, aborting....`);
  process.exit();
} else if (process.env.SGX_MODE == "SW") {
  EnigmaContract = require("../build/enigma_contracts/EnigmaSimulation.json");
} else {
  EnigmaContract = require("../build/enigma_contracts/Enigma.json");
}
const EnigmaTokenContract = require("../build/enigma_contracts/EnigmaToken.json");

// promisified timeout
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let enigma = null;

// computes task and returns decrypted result
const compute = async ({ fn, args, userAddr, contractAddr }) => {
  let task = await new Promise((resolve, reject) => {
    enigma
      .computeTask(
        fn,
        args,
        10000000,
        utils.toGrains(1),
        userAddr,
        contractAddr
      )
      .on(eeConstants.SEND_TASK_INPUT_RESULT, result => resolve(result))
      .on(eeConstants.ERROR, error => reject(error));
  });

  while (task.ethStatus !== 2) {
    if (task.ethStatus === 3) {
      throw Error("task failed");
    } else if (task.ethStatus === 4) {
      console.log(task);
      throw Error("transaction reverted");
    }

    await sleep(1000);
    task = await enigma.getTaskRecordStatus(task);
  }

  const result = await new Promise((resolve, reject) => {
    enigma
      .getTaskResult(task)
      .on(eeConstants.GET_TASK_RESULT_RESULT, result => resolve(result))
      .on(eeConstants.ERROR, error => reject(error));
  });

  return enigma.decryptTaskResult(result);
};

const rawAddrToStr = raw =>
  web3.utils.toChecksumAddress(`0x${raw.slice(24, 64)}`);
const rawUint256ToStr = raw => String(parseInt(raw, 16));

const decodeLotteryInfo = output => {
  const [
    id_raw,
    contract_addr_raw,
    token_id_raw,
    participants_raw,
    max_participants_raw,
    winner_raw,
    status_raw
  ] = output.match(/.{1,64}/g);

  return {
    id: rawUint256ToStr(id_raw),
    contract_addr: rawAddrToStr(contract_addr_raw),
    token_id: rawUint256ToStr(token_id_raw),
    participants: rawUint256ToStr(participants_raw),
    max_participants: rawUint256ToStr(max_participants_raw),
    winner: rawAddrToStr(winner_raw),
    status: rawUint256ToStr(status_raw)
  };
};

contract("lottery", accounts => {
  const [owner, user1, user2] = accounts;
  const tokenId = 1;

  let secretContractAddr = null;
  let enigmaAddr = EnigmaContract.networks["4447"].address;
  let token = null;
  let deposit = null;

  before(async function() {
    // setup enigma
    enigma = new Enigma(
      web3,
      enigmaAddr,
      EnigmaTokenContract.networks["4447"].address,
      "http://localhost:3346",
      {
        gas: 4712388,
        gasPrice: 100000000000,
        from: owner
      }
    );
    enigma.admin();

    // get secret contract address
    secretContractAddr = fs.readFileSync("test/lottery.txt", "utf-8");

    // setup token
    token = await NFTContract.at(NFTContract.address);
    await token.mint(owner, 1);
    await token.mint(owner, 2);

    deposit = await DepositContract.at(DepositContract.address);
  });

  // NOTE: helps with race-condition causing tests to fail
  beforeEach("sleep", async () => {
    await sleep(2000);
  });

  it("get length of whitelist", async () => {
    const result = await compute({
      fn: "get_whitelist_size()",
      args: "",
      userAddr: owner,
      contractAddr: secretContractAddr
    });

    expect(parseInt(result.decryptedOutput, 16)).to.equal(0);
  });

  it("add to whitelist", async () => {
    await compute({
      fn: "add_to_whitelist(address[], address)",
      args: [[[user1, user2], "address[]"], [owner, "address"]],
      userAddr: owner,
      contractAddr: secretContractAddr
    });

    const result = await compute({
      fn: "get_whitelist_size()",
      args: "",
      userAddr: owner,
      contractAddr: secretContractAddr
    });

    expect(parseInt(result.decryptedOutput, 16)).to.equal(2);
  });

  it("create lottery #1", async () => {
    await token.approve(deposit.address, tokenId);

    await compute({
      fn: "create_lottery(address, uint256, uint256, address)",
      args: [
        [token.address, "address"],
        [tokenId, "uint256"],
        [2, "uint256"],
        [owner, "address"]
      ],
      userAddr: owner,
      contractAddr: secretContractAddr
    });

    const ownerOfToken = await token.ownerOf(tokenId);
    expect(ownerOfToken).to.equal(deposit.address);

    const secretLength = await compute({
      fn: "get_lotteries_size()",
      args: "",
      userAddr: owner,
      contractAddr: secretContractAddr
    }).then(res => rawUint256ToStr(res.decryptedOutput));

    const smartLength = await deposit.lotteriesLength
      .call()
      .then(res => res.toString());

    expect(secretLength).to.equal("1");
    expect(smartLength).to.equal("1");
  });

  it("join lottery #1 by users", async () => {
    await compute({
      fn: "join_lottery(uint256, address)",
      args: [[1, "uint256"], [user1, "address"]],
      userAddr: owner,
      contractAddr: secretContractAddr
    });

    await compute({
      fn: "join_lottery(uint256, address)",
      args: [[1, "uint256"], [user2, "address"]],
      userAddr: owner,
      contractAddr: secretContractAddr
    });

    const result = await compute({
      fn: "get_lottery_info(uint256)",
      args: [[1, "uint256"]],
      userAddr: owner,
      contractAddr: secretContractAddr
    });

    expect(decodeLotteryInfo(result.decryptedOutput).participants).to.equal(
      "2"
    );
  });

  it("roll lottery #1", async () => {
    const participants = [user1, user2];

    const result = await compute({
      fn: "roll(uint256)",
      args: [[1, "uint256"]],
      userAddr: owner,
      contractAddr: secretContractAddr
    }).then(res => rawAddrToStr(res.decryptedOutput));

    const ownerOfToken = await token.ownerOf(tokenId);

    expect(participants).to.include(result);
    expect(participants).to.include(ownerOfToken);
  });
});
