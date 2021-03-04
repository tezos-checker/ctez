#if !OVEN_TYPES
#define OVEN_TYPES

type edit =
  | Allow_any of bool
  | Allow_account of bool * address

type oven_parameter =
  | Oven_delegate of (key_hash option)
  | Oven_deposit
  | Oven_edit_depositor of edit
  | Oven_withdraw of tez * (unit contract)

type depositors =
  | Any
  | Whitelist of address set

type oven_storage = {
  admin : address (* vault admin contract *) ;
  owner : address (* owner of the oven *) ;
  depositors : depositors (* who can deposit in the oven *) ;
  }
type oven_result = (operation list) * oven_storage

#endif