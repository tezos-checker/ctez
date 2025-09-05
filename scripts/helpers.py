from typing import Optional
from pytezos import pytezos, PyTezosClient

from scripts.environment import load_or_ask

def create_manager(
    private_key: Optional[str],
    rpc_url: Optional[str],
) -> PyTezosClient:
    private_key = private_key or load_or_ask('PRIVATE_KEY', is_secret=True)
    rpc_url = rpc_url or load_or_ask('RPC_URL')
    return pytezos.using(shell=rpc_url, key=private_key)

def get_balance_mutez(manager: PyTezosClient, address: str) -> int:
    return int(manager.account(address)['balance'])
