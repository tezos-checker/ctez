#!/usr/bin/env bash
set -x

mkdir _build

# Modify as need to deploy on different networks
TZC="../Tezos/tezos/tezos-client --mode mockup --base-dir _build/mockup"

rm -rf _build/mockup
$TZC create mockup

deployment_key="bootstrap1"
deployment_key_address=`$TZC show address ${deployment_key} | head -n 1 | awk '{print $2}'`

# Build and deploy ctez
ligo compile-contract ctez.mligo main > _build/ctez.tz
ligo compile-storage ctez.mligo main "$(<ctez_initial_storage.mligo)" > _build/ctez_storage.tz
$TZC originate contract ctez transferring 0 from $deployment_key running 'file:_build/ctez.tz' --init "$(<_build/ctez_storage.tz)" --burn-cap 10
CTEZ_ADDRESS=`$TZC show known contract ctez`

# Build and deploy the fa12 for ctez
ligo compile-contract fa12.mligo main > _build/fa12.tz
ligo compile-storage fa12.mligo main "$(sed s/ADMIN_ADDRESS/$CTEZ_ADDRESS/ < fa12_ctez_initial_storage.mligo)" > _build/fa12_ctez_storage.tz
$TZC originate contract fa12_ctez transferring 0 from $deployment_key running 'file:_build/fa12.tz' --init "$(<_build/fa12_ctez_storage.tz)" --burn-cap 10 
FA12_CTEZ_ADDRESS=`$TZC show known contract fa12_ctez`

# Build and deploy cfmm
echo "[@inline] let const_CONSUMER_ADDRESS = (\"${CTEZ_ADDRESS}\" : address)" > _build/oracle_constant.mligo
ligo compile-contract cfmm_with_oracle.mligo main > _build/cfmm.tz
sed s/MANAGER_ADDRESS/${deployment_key_address}/ < cfmm_initial_storage.mligo | sed s/FA12_CTEZ/${FA12_CTEZ_ADDRESS}/ > _build/cfmm_storage.mligo
ligo compile-storage cfmm_with_oracle.mligo main "$(<_build/cfmm_storage.mligo)" > _build/cfmm_storage.tz
$TZC originate contract cfmm transferring 0.000001 from $deployment_key running 'file:_build/cfmm.tz' --init "$(<_build/cfmm_storage.tz)" --burn-cap 10 
CFMM_ADDRESS=`$TZC show known contract cfmm`

# Build and deploy the fa12 for the cfmm lqt, specifying the cfmm as admin
ligo compile-storage fa12.mligo main "$(sed s/ADMIN_ADDRESS/$CFMM_ADDRESS/ < fa12_ctez_initial_storage.mligo)" > _build/fa12_lqt_storage.tz
$TZC originate contract fa12_lqt transferring 0 from $deployment_key running 'file:_build/fa12.tz' --init "$(<_build/fa12_lqt_storage.tz)" --burn-cap 10 
FA12_LQT_ADDRESS=`$TZC show known contract fa12_lqt`

# Set the lqt fa12 address in the cfmm
$TZC transfer 0 from $deployment_key to cfmm --entrypoint setLqtAddress --arg "\"$FA12_LQT_ADDRESS\"" --burn-cap 10

# Set the ctez fa12 address and the cfmm address in the oven management contract
$TZC transfer 0 from $deployment_key to ctez --entrypoint set_addresses --arg "Pair \"$CFMM_ADDRESS\" \"$FA12_CTEZ_ADDRESS\"" --burn-cap 10
