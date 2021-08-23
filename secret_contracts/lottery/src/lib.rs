/*
  # Storage
  We do not store all state on a single HashMap, instead we store every Lottery seperately.
  This is so we can save gas costs, and avoid unnecessary serializations / deserializations.
*/
#![no_std]
#![allow(unused_attributes)]

extern crate eng_wasm;
extern crate eng_wasm_derive;
extern crate rustc_hex;
extern crate serde;
extern crate serde_derive;
extern crate std;

use eng_wasm::*;
use eng_wasm_derive::{pub_interface, eth_contract};
use rustc_hex::ToHex;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;

// constant variables
static MAX_PARTICIPANTS: u16 = 1000;

// private state keys
static OWNERSHIP: &str = "OWNERSHIP";
static WHITELIST: &str = "WHITELIST";
static LOTTERIES: &str = "LOTTERIES";
static LOTTERY: &str = "LOTTERY_"; // dynamically generated afterwards "LOTTERY_<ID>"

// owner
#[derive(Serialize, Deserialize)]
pub struct Ownership {
  owner_addr: H160,
  deposit_addr: H160,
}

// a hashset of whitelisted addresses
#[derive(Serialize, Deserialize)]
pub struct Whitelist(HashSet<H160>);

// incremental lottery number, used to create new lotteries
#[derive(Serialize, Deserialize)]
pub struct Lotteries(U256);

// lottery status enum
#[derive(Serialize, Deserialize, PartialEq, Eq, Clone, Copy)]
enum LotteryStatus {
  JOINING = 0,
  READY = 1,
  COMPLETE = 2,
}

// lottery
#[derive(Serialize, Deserialize)]
pub struct Lottery {
  id: U256,
  contract_addr: H160,
  token_id: U256,
  participants: Vec<H160>,
  max_participants: U256,
  winner: H160,
  status: LotteryStatus,
}
// lottery info
type LotteryInfo = (U256, H160, U256, U256, U256, H160, U256);

#[eth_contract("Deposit.json")]
struct EthContract;

pub struct Contract;

#[pub_interface]
pub trait ContractInterface {
  fn construct(owner_addr: H160, deposit_addr: H160) -> ();
  fn add_to_whitelist(address: Vec<H160>) -> ();
  fn get_whitelist_size() -> U256;
  fn create_lottery(
    contract_addr: H160,
    token_id: U256,
    max_participants: U256,
    owner_addr: H160,
  ) -> U256;
  fn get_lotteries_size() -> U256;
  fn join_lottery(lottery_num: U256, address: H160) -> ();
  fn get_lottery_info(lottery_num: U256) -> LotteryInfo;
  fn roll(lottery_num: U256) -> H160;
}

// returns a Lottery state key, ex: "LOTTERY_1"
fn create_lottery_key(lottery_num: U256) -> String {
  let mut key = String::from(LOTTERY);
  key.push_str(&lottery_num.to_string());

  return key;
}

// add prefix "0x" to address string
fn h160_to_string(address: H160) -> String {
  let addr_str: String = address.to_hex();

  return [String::from("0x"), addr_str].concat();
}

// TODO: this may need improvement
fn random_range(my_max: u16) -> u16 {
  let entropy: u8 = Rand::gen();
  let system_max: u8 = u8::max_value();

  return (my_max * (entropy as u16)) / (system_max as u16);
}

// secret fns
impl Contract {
  fn get_ownership() -> Ownership {
    match read_state!(OWNERSHIP) {
      Some(ownership) => ownership,
      None => panic!("ownership should already exist"),
    }
  }

  fn get_whitelist() -> HashSet<H160> {
    match read_state!(WHITELIST) {
      Some(whitelist) => whitelist,
      None => HashSet::new(),
    }
  }

  fn get_lotteries() -> U256 {
    match read_state!(LOTTERIES) {
      Some(lotteries) => lotteries,
      None => U256::from(0),
    }
  }

  fn get_lottery(lottery: &str) -> Lottery {
    match read_state!(lottery) {
      Some(lottery) => lottery,
      None => panic!("lottery does not exist"),
    }
  }

  // TODO: needs security check, see: https://forum.enigma.co/t/enigmasimulation/1070/16?u=nioni
  // thus not used
  // fn is_whitelisted(address: H160) -> bool {
  //   let mut whitelist = Self::get_whitelist();

  //   return whitelist.contains(&address);
  // }
}

// public fns
impl ContractInterface for Contract {
  #[no_mangle]
  fn construct(owner_addr: H160, deposit_addr: H160) -> () {
    write_state!(OWNERSHIP => Ownership {
      owner_addr: owner_addr,
      deposit_addr: deposit_addr
    });
  }

  #[no_mangle]
  fn add_to_whitelist(addresses: Vec<H160>) -> () {
    let mut whitelist = Self::get_whitelist();

    assert!((whitelist.len() + addresses.len()) <= MAX_PARTICIPANTS as usize);

    // insert new addresses
    whitelist.extend(addresses.iter());

    write_state!(WHITELIST => whitelist);
  }

  #[no_mangle]
  fn get_whitelist_size() -> U256 {
    let whitelist = &Self::get_whitelist();

    return U256::from(whitelist.len());
  }

  #[no_mangle]
  fn create_lottery(
    contract_addr: H160,
    token_id: U256,
    max_participants: U256,
    owner_addr: H160,
  ) -> U256 {
    let ownership = &Self::get_ownership();
    let lotteries = Self::get_lotteries();

    // make new id
    let id = lotteries.checked_add(U256::from(1)).unwrap();

    let lottery = Lottery {
      id: id,
      contract_addr: contract_addr,
      token_id: token_id,
      participants: Vec::new(),
      max_participants: max_participants,
      winner: H160::zero(),
      status: LotteryStatus::JOINING,
    };

    // update Deposit & claim
    let deposit = EthContract::new(&h160_to_string(ownership.deposit_addr));
    deposit.lotteryCreated(
      id,
      token_id,
      max_participants,
      contract_addr,
      owner_addr
    );

    write_state!(LOTTERIES => id, &create_lottery_key(id) => lottery);

    return lotteries;
  }

  #[no_mangle]
  fn get_lotteries_size() -> U256 {
    return Self::get_lotteries();
  }

  #[no_mangle]
  fn join_lottery(lottery_num: U256, address: H160) -> () {
    let ownership = &Self::get_ownership();
    let lottery_key = &create_lottery_key(lottery_num);
    let mut lottery = Self::get_lottery(lottery_key);
    let max_participants = U256::as_usize(&lottery.max_participants);

    // check if max amount of lottery participants reached
    assert!(
      lottery.participants.len() < max_participants,
      "max amount of lottery people"
    );

    // check if participant exists
    assert!(
      !lottery.participants.contains(&address),
      "participant already exists"
    );

    // insert new participants
    lottery.participants.push(address);

    // if lottery participants reached maximum update lottery status
    if lottery.participants.len() >= max_participants {
      lottery.status = LotteryStatus::READY;
    }

    // update Deposit
    let deposit = EthContract::new(&h160_to_string(ownership.deposit_addr));
    deposit.userJoined(lottery.id, U256::from(lottery.status as usize));

    write_state!(lottery_key => lottery);
  }

  #[no_mangle]
  fn get_lottery_info(lottery_num: U256) -> LotteryInfo {
    let lottery_key = &create_lottery_key(lottery_num);
    let lottery = Self::get_lottery(lottery_key);

    return (
      lottery.id,
      lottery.contract_addr,
      lottery.token_id,
      U256::from(lottery.participants.len()),
      lottery.max_participants,
      lottery.winner,
      U256::from(lottery.status as u32),
    );
  }

  #[no_mangle]
  fn roll(lottery_num: U256) -> H160 {
    let ownership = &Self::get_ownership();
    let lottery_key = &create_lottery_key(lottery_num);
    let mut lottery = Self::get_lottery(lottery_key);

    assert!(
      lottery.status == LotteryStatus::READY,
      "lottery is not ready to roll"
    );

    let index = random_range(lottery.participants.len() as u16);
    let winner = lottery.participants[index as usize];

    lottery.status = LotteryStatus::COMPLETE;

    // update Deposit & release
    let deposit = EthContract::new(&h160_to_string(ownership.deposit_addr));
    deposit.winnerSelected(lottery.id, winner);

    write_state!(lottery_key => lottery);

    return winner;
  }
}
