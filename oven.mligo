#include "oven_types.mligo"

let create_oven (delegate : key_hash option) (amnt : tez) (storage : oven_storage) = Tezos.create_contract
        (* Contract code for an oven *)
	(fun (p , s : oven_parameter * oven_storage) -> (
	    (* error codes *)
	    let error_WITHDRAW_CAN_ONLY_BE_CALLED_FROM_MAIN_CONTRACT = 1001n in
	    let error_ONLY_OWNER_CAN_DELEGATE = 1002n in
	    let error_CANNOT_FIND_REGISTER_DEPOSIT_ENTRYPOINT = 1003n in
	    let error_UNAUTHORIZED_DEPOSITOR = 1004n in
	    let error_SET_ANY_OFF_FIRST = 1005n in
	    let error_ONLY_OWNER_CAN_EDIT_DEPOSITORS = 1006n in
	    (match p with
	    (* Withdraw form the oven, can only be called from the main contract. *)
	    | Oven_withdraw x ->
		if Tezos.get_sender () <> s.admin then
		(failwith error_WITHDRAW_CAN_ONLY_BE_CALLED_FROM_MAIN_CONTRACT : oven_result)
		else
		([Tezos.transaction unit x.0 x.1], s)
	    (* Change delegation *)
	    | Oven_delegate ko ->
		if Tezos.get_sender () <> s.handle.owner then
		(failwith error_ONLY_OWNER_CAN_DELEGATE : oven_result)
		else ([Tezos.set_delegate ko], s)
	    (* Make a deposit. If authorized, this will notify the main contract. *)
	    | Oven_deposit ->
		if Tezos.get_sender () = s.handle.owner or (
		    match s.depositors with
			| Any -> true
			| Whitelist depositors -> Set.mem (Tezos.get_sender ()) depositors
		) then
		    let register = (
			match (Tezos.get_entrypoint_opt "%register_deposit" s.admin : (register_deposit contract) option) with
			| None -> (failwith error_CANNOT_FIND_REGISTER_DEPOSIT_ENTRYPOINT : register_deposit contract)
			| Some register -> register) in
		    (([ Tezos.transaction {amount = Tezos.get_amount () ; handle = s.handle} 0mutez register] : operation list), s)
		else
		    (failwith error_UNAUTHORIZED_DEPOSITOR : oven_result)
	    (* Edit the set of authorized depositors. Insert tz1authorizeAnyoneToDeposit3AC7qy8Qf to authorize anyone. *)
	    | Oven_edit_depositor edit ->
		if Tezos.get_sender () <> s.handle.owner then
		    (failwith error_ONLY_OWNER_CAN_EDIT_DEPOSITORS : oven_result)
		else
		    let depositors = (match edit with
			| Allow_any allow -> if allow then Any else Whitelist (Set.empty : address set)
			| Allow_account x -> let (allow, depositor) = x in (match s.depositors with
			    | Any -> (failwith error_SET_ANY_OFF_FIRST : depositors)
			    | Whitelist depositors -> Whitelist (
				if allow then Set.add depositor depositors else Set.remove depositor depositors))) in
		    (([] : operation list), {s with depositors = depositors}))))
        (* End of contract code for an oven *)
	delegate amnt storage


