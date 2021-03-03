#if !OVEN_TYPES
#define OVEN_TYPES

type oven_parameter =
  | Oven_delegate of (key_hash option)
  | Oven_deposit
  | Oven_edit_depositor of address * bool
  | Oven_withdraw of tez * (unit contract)

type oven_storage = {
  admin : address (* vault admin contract *) ;
  owner : address (* owner of the oven *) ;
  depositors : address set (* who can deposit in the oven *) ;
  }
type oven_result = (operation list) * oven_storage

#endif