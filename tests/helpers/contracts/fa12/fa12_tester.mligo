module Fa12Tester = struct
    type callback_info = (string * nat)

    type storage = {
        send_tez : bool;
        fa12_address : address;
        last_callback : callback_info option;
    }

    type allowance_key = { 
        owner : address;
        spender : address 
    }

    type get_allowance = { 
        request : allowance_key;
        callback : nat contract 
    }

    type get_balance = { 
        owner : address;
        callback : nat contract
    }

    type get_total_supply = { 
        request : unit ;
        callback : nat contract 
    }

    type result = operation list * storage

    let save_callback_info (callback_info : callback_info) (storage : storage) : storage =
        let () = Assert.Error.assert (Option.is_none storage.last_callback) "ONLY_ONE_CALLBACK_CALL_EXPECTED" in
        { storage with last_callback = Some callback_info }

    [@entry] 
    let reset (() : unit) (storage : storage) : result =
        [], { storage with last_callback = None }

    [@entry] 
    let call_get_allowance (key : allowance_key) (storage : storage) : result =
        let callback : nat contract = Tezos.get_entrypoint "%on_get_allowance" (Tezos.get_self_address ()) in
        let contract : get_allowance contract = Tezos.get_entrypoint "%getAllowance" storage.fa12_address in
        let params : get_allowance = {
            request = key;
            callback = callback;
        } in
        [(Tezos.Next.Operation.transaction params (if storage.send_tez then 1mutez else 0mutez) contract)], storage

    [@entry] 
    let on_get_allowance (value : nat) (storage : storage) : result =
        [], save_callback_info ("on_get_allowance", value) storage

    [@entry] 
    let call_get_balance (owner : address) (storage : storage) : result =
        let callback : nat contract = Tezos.get_entrypoint "%on_get_balance" (Tezos.get_self_address ()) in
        let contract : get_balance contract = Tezos.get_entrypoint "%getBalance" storage.fa12_address in
        let params : get_balance = {
            owner = owner;
            callback = callback;
        } in
        [(Tezos.Next.Operation.transaction params (if storage.send_tez then 1mutez else 0mutez) contract)], storage

    [@entry] 
    let on_get_balance (value : nat) (storage : storage) : result =
        [], save_callback_info ("on_get_balance", value) storage

    [@entry] 
    let call_get_total_supply (_ : unit) (storage : storage) : result =
        let callback : nat contract = Tezos.get_entrypoint "%on_get_total_supply" (Tezos.get_self_address ()) in
        let contract : get_total_supply contract = Tezos.get_entrypoint "%getTotalSupply" storage.fa12_address in
        let params : get_total_supply = {
            request = ();
            callback = callback;
        } in
        [(Tezos.Next.Operation.transaction params (if storage.send_tez then 1mutez else 0mutez) contract)], storage

    [@entry] 
    let on_get_total_supply (value : nat) (storage : storage) : result =
        [], save_callback_info ("on_get_total_supply", value) storage
end
