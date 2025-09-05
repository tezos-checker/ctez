#include "common/stdctez.mligo"
#import "common/errors.mligo" "Errors"

type edit =
  | Allow_any of bool
  | Allow_account of bool * address

type withdraw = tez * (unit contract)

type entrypoint =
  | Delegate of (key_hash option)
  | [@annot:default] Deposit
  | Edit_depositor of edit
  | Withdraw of withdraw

type depositors =
  | Any
  | Whitelist of address set

type handle = {
	id : nat; 
	owner : address;
}

type register_deposit = { 
  handle : handle; 
  amount : tez;
}

type storage = {
  admin : address (* vault admin contract *) ;
  handle : handle (* owner of the oven *) ;
  depositors : depositors (* who can deposit in the oven *) ;
}

type result = storage with_operations

[@inline]
let assert_sender_is
    (expected_sender : address)
    (error : string)
    : unit =
  Assert.Error.assert (Tezos.get_sender() = expected_sender) error

[@inline]
let assert_depositor_authorized
    (owner : address)
    (depositors : depositors)
    : unit =
  let is_authorized = Tezos.get_sender () = owner or (
    match depositors with
      | Any -> true
      | Whitelist depositors -> Set.mem (Tezos.get_sender ()) depositors
  ) in
  Assert.Error.assert is_authorized Errors.unauthorized_depositor

(** 
  Withdraws tez from the oven
  Parameters: 
    - w: Pair of amount and recipient address
  Pre-conditions: 
    - Only the admin of the contract can call this entrypoint
  Post-conditions: 
    - Sends the specified amount of tez to the recipient address
  Errors: 
    - "ONLY_MAIN_CONTRACT_CAN_CALL" if not called by the admin
  Return: 
    - Transaction that sends the specified amount of tez to the recipient
    - Unchanged storage
*)
[@inline]
let withdraw (w : withdraw) (s : storage) : result =
  let () = assert_sender_is s.admin Errors.only_main_contract_can_call in 
  ([Tezos.Next.Operation.transaction unit w.0 w.1], s)

(** 
  Sets the delegate of the contract to the specified key hash or removes delegation.
  Parameters:
    - d: The key hash of the delegate to set. None to remove.
  Pre-conditions:
    - The sender of the transaction must be the owner of the contract.
    - The transaction must not contain any tez.
  Post-conditions:
    - The delegate is set to the given key hash or removed.
  Errors:
    - "TEZ_IN_TRANSACTION_DISALLOWED": Thrown if the transaction contains tez.
    - "ONLY_OWNER_CAN_CALL": Thrown if the sender is not the owner of the contract.
  Return:
    - ops: The operation to set or remove the delegate.
    - s: Unchanged storage.
*)
[@inline]
let delegate (d : key_hash option) (s : storage) : result =
  let () = assert_no_tez_in_transaction() in
  let () = assert_sender_is s.handle.owner Errors.only_owner_can_call in 
  let ops = [Tezos.Next.Operation.set_delegate d] in 
  (ops, s)

(** 
  Deposits tez into the oven and notifies the main contract
  Pre-conditions:
    - The sender of the transaction must be authorized to deposit into the oven (i.e., 
      the sender must be the owner of the oven or in the whitelist of authorized depositors).
  Post-conditions:
    - The tez balance of the oven is increased by the amount of the deposit.
  Errors:
    - "UNAUTHORIZED_DEPOSITOR": Thrown if the sender of the transaction is not authorized to deposit into the oven.
    - "MISSING_DEPOSIT_ENTRYPOINT": Thrown if the ctez admin contract does not have a "%register_oven_deposit" entrypoint.
  Return:
    - ops: Operations that registers the deposit in the ctez admin contract.
    - s: Unchanged storage.
*)
[@inline]
let deposit (s : storage) : result =
  let () = assert_depositor_authorized s.handle.owner s.depositors in
  let register = (
    match (Tezos.get_entrypoint_opt "%register_oven_deposit" s.admin : (register_deposit contract) option) with
      | None -> (failwith Errors.missing_deposit_entrypoint : register_deposit contract)
      | Some register -> register) in
  (([ Tezos.Next.Operation.transaction {amount = Tezos.get_amount () ; handle = s.handle} 0mutez register] : operation list), s)

(** 
  Edits the set of authorized depositors of the oven. 
  Parameters: 
    - edit: The edit operation to be performed. 
      - Allow_any: Sets the depositors to any or clears the whitelist.
      - Allow_account: Adds or removes a depositor from the whitelist.
  Pre-conditions: 
    - The transaction must not contain any tez.
    - The sender must be the owner of the oven.
  Post-conditions: 
    - The depositors are updated according to the edit operation.
  Errors: 
    - "TEZ_IN_TRANSACTION_DISALLOWED": Thrown if the transaction contains tez.
    - "ONLY_OWNER_CAN_CALL": Thrown if the sender is not the owner of the oven.
    - "SET_ANY_OFF_FIRST": Thrown if the sender tries to add or remove a depositor when the previous value is "Any"
  Return: 
    - updated storage with the new allowed depositors. 
*)
[@inline]
let edit_depositor (edit : edit) (s : storage) : result =
  let () = assert_no_tez_in_transaction() in
  let () = assert_sender_is s.handle.owner Errors.only_owner_can_call in 
  let depositors = (match edit with
    | Allow_any allow -> if allow then Any else Whitelist (Set.empty : address set)
    | Allow_account (allow, depositor) -> (match s.depositors with
      | Any -> (failwith Errors.set_any_off_first : depositors)
      | Whitelist depositors -> Whitelist (
    if allow then Set.add depositor depositors else Set.remove depositor depositors))) in
  (([] : operation list), { s with depositors })

[@inline]
let main (p : entrypoint) (s : storage) : result =
  match p with
    | Withdraw w -> withdraw w s
    | Delegate d -> delegate d s
    | Deposit -> deposit s
    | Edit_depositor e -> edit_depositor e s

let originate_oven 
    (delegate : key_hash option) 
    (amount : tez) 
    (storage : storage) = 
  Tezos.Next.Operation.create_contract main delegate amount storage
