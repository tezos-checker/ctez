#if !OVEN_TYPES
#define OVEN_TYPES

type edit =
  | Allow_any of bool
  | Allow_account of bool * address

type oven_parameter =
  | Oven_delegate of (key_hash option)
  | [@annot:default] Oven_deposit
  | Oven_edit_depositor of edit
  | Oven_withdraw of tez * (unit contract)

type depositors =
  | Any
  | Whitelist of address set

type oven_handle = [@layout:comb] {id : nat ; owner : address}
type register_deposit = [@layout:comb] { handle : oven_handle ; amount : tez }


type oven_storage = {
  admin : address (* vault admin contract *) ;
  handle : oven_handle (* owner of the oven *) ;
  depositors : depositors (* who can deposit in the oven *) ;
  }
type oven_result = (operation list) * oven_storage



#endif