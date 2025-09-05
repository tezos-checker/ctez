#include "common/stdctez.mligo"

type transfer = { 
  [@annot:from] 
  address_from : address;
  [@annot:to] 
  address_to : address;
  value : nat;
}

type approve = { 
  spender : address;
  value : nat;
}

type mintOrBurn = { 
  quantity : int;
  target : address;
}

type allowance_key = { 
  owner : address;
  spender : address;
}

type getAllowance = { 
  request : allowance_key;
  callback : nat contract;
}

type getBalance = { 
  owner : address;
  callback : nat contract;
}

type getTotalSupply = { 
  request : unit ;
  callback : nat contract; 
}

type allowances = (address, nat) map
type accountInfo = {
  amount : nat;
  allowances : allowances
}
type ledger = (address, accountInfo) big_map

type storage = { 
  ledger: ledger;
  admin : address;
  total_supply : nat;
  metadata : (string, bytes) big_map;
}

type parameter =
  | Transfer of transfer
  | Approve of approve
  | MintOrBurn of mintOrBurn
  | GetAllowance of getAllowance
  | GetBalance of getBalance
  | GetTotalSupply of getTotalSupply

type result = operation list * storage

[@inline]
let maybe (n : nat) : nat option =
  if n = 0n
  then (None : nat option)
  else Some n

[@inline]
let findAccount (address: address) (ledger: ledger) : accountInfo =
  match Big_map.find_opt address ledger with
    | Some value -> value
    | None -> { amount = 0n; allowances = Map.empty }

[@inline]
let findAllowance (address: address) (allowances: allowances) : nat =
  match Map.find_opt address allowances with
    | Some value -> value
    | None -> 0n

[@inline]
let findAccountAllowance (owner: address) (spender: address) (ledger: ledger) : nat =
  let ownerAccount = findAccount owner ledger in
  findAllowance spender ownerAccount.allowances

let transfer ({address_from; address_to; value} : transfer) (storage : storage) : result =
  let ledger = storage.ledger in
  let owner = address_from in
  let receiver = address_to in
  let spender = Tezos.get_sender () in
  let ownerAccount: accountInfo = findAccount owner ledger in
  let receiverAccount: accountInfo = findAccount receiver ledger in
  let ownerAccount =
    if Tezos.get_sender () = owner
    then 
      ownerAccount
    else
      let authorizedValue = findAllowance spender ownerAccount.allowances in
      let authorizedValue = subtract_nat authorizedValue value "NotEnoughAllowance" in
      {
        ownerAccount with
        allowances = Map.update spender (maybe authorizedValue) ownerAccount.allowances
      } in
  let ownerAccount = {
    ownerAccount with
    amount = subtract_nat ownerAccount.amount value "NotEnoughBalance"
  } in
  let receiverAccount = {
    receiverAccount with
    amount = receiverAccount.amount + value
  } in
  let ledger = Big_map.update owner (Some ownerAccount) ledger in
  let ledger = Big_map.update receiver (Some receiverAccount) ledger in
  (([] : operation list), { storage with ledger })

let approve ({spender; value} : approve) (storage : storage) : result =
  let ledger = storage.ledger in
  let owner = Tezos.get_sender () in
  let ownerAccount = findAccount owner ledger in
  let previousValue = findAllowance spender ownerAccount.allowances in
  let () = Assert.Error.assert (previousValue = 0n || value = 0n) "UnsafeAllowanceChange" in
  let ownerAccount = {
    ownerAccount with
    allowances = Map.update spender (maybe value) ownerAccount.allowances
  } in
  let ledger = Big_map.update owner (Some ownerAccount) ledger in
  (([] : operation list), { storage with ledger = ledger })

let mintOrBurn ({quantity; target} : mintOrBurn) (storage : storage) : result =
  let () = Assert.Error.assert (Tezos.get_sender () = storage.admin) "OnlyAdmin" in
  let ledger = storage.ledger in
  let targetAccount = findAccount target ledger in
  let targetAccount = { 
    targetAccount with 
    amount = add_int_to_nat targetAccount.amount quantity "CannotBurnMoreThanTheTargetsBalance"
  } in
  let ledger = Big_map.update target (Some targetAccount) ledger in
  let total_supply = add_int_to_nat storage.total_supply quantity "CannotBurnMoreThanTheTotalSupply" in
  (([] : operation list), { storage with ledger = ledger ; total_supply = total_supply })

let getAllowance ({request; callback} : getAllowance) (storage : storage) : operation list =
  let value = findAccountAllowance request.owner request.spender storage.ledger in
  [Tezos.Next.Operation.transaction value 0mutez callback]

let getBalance ({owner; callback} : getBalance) (storage : storage) : operation list =
  let ownerAccount = findAccount owner storage.ledger in
  [Tezos.Next.Operation.transaction ownerAccount.amount 0mutez callback]

let getTotalSupply ({request = _; callback} : getTotalSupply) (storage : storage) : operation list =
  let total = storage.total_supply in
  [Tezos.Next.Operation.transaction total 0mutez callback]

[@view] 
let viewAllowance ({owner; spender} : allowance_key) (storage : storage) : nat =
  findAccountAllowance owner spender storage.ledger

[@view] 
let viewBalance (owner : address) (storage : storage) : nat =
  let ownerAccount = findAccount owner storage.ledger in
  ownerAccount.amount

[@view] 
let viewTotalSupply (() : unit) (s : storage) : nat =
  s.total_supply

[@entry] 
let main (param : parameter) (storage : storage) : result =
  let () = Assert.Error.assert (Tezos.get_amount () = 0mutez) "DontSendTez" in
  match param with
    | Transfer param -> transfer param storage
    | Approve param -> approve param storage
    | MintOrBurn param -> mintOrBurn param storage
    | GetAllowance param -> (getAllowance param storage, storage)
    | GetBalance param -> (getBalance param storage, storage)
    | GetTotalSupply param -> (getTotalSupply param storage, storage)
