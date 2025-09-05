from typing import Union
from pytezos.client import PyTezosClient

from tests.helpers.contracts.contract import ContractHelper


Addressable = Union[ContractHelper, PyTezosClient, str]


def get_address(client_or_contract: Addressable) -> str:
    if isinstance(client_or_contract, ContractHelper):
        return client_or_contract.address
    if isinstance(client_or_contract, PyTezosClient):
        return client_or_contract.key.public_key_hash()
    if isinstance(client_or_contract, str):
        return client_or_contract
    raise ValueError(f'Unsupported type: {type(client_or_contract)}')
