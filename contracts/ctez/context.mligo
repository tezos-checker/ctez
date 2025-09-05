#include "../common/stdctez.mligo"

type t = { 
  target : Float64.t; 
  drift : int; 
  _Q : nat; (* Q is the desired quantity of ctez in the ctez half dex,
            floor(Q * target) is the desired quantity of tez in the tez half dex *)
  ctez_fa12_address : address;
}

let transfer_xtz (to_ : address) (amount : nat) : operation =
  let contract = (Tezos.get_contract to_ : unit contract) in
  Tezos.Next.Operation.transaction () (amount * 1mutez) contract

type fa12_transfer = {
  [@annot:from] 
  from_ : address; 
  [@annot:to] 
  to_ : address; 
  value : nat 
}

let transfer_ctez (t : t) (from_ : address) (to_ : address) (value : nat) : operation =
  let contract = (Tezos.get_entrypoint "%transfer" t.ctez_fa12_address : fa12_transfer contract) in
  Tezos.Next.Operation.transaction { from_; to_; value } 0mutez contract
