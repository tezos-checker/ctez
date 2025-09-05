from pytezos import PyTezosClient
from scripts.helpers import create_manager
from tests.helpers.addressable import get_address
from tests.helpers.contracts.ctez2.ctez2 import Ctez2
from typing import Optional
import click
from tests.helpers.contracts.fa12.fa12 import Fa12
from tests.helpers.metadata import Metadata
from scripts.metadata import ctez_metadata, ctez_fa12_metadata

@click.command()
@click.option('--with-metadata', default=False, help='Should the metadata field be filled in the contract storages.')
@click.option('--private-key', default=None, help='Use the provided private key.')
@click.option('--rpc-url', default=None, help='Tezos RPC URL.')
def deploy(
    with_metadata: Optional[bool],
    private_key: Optional[str],
    rpc_url: Optional[str],
) -> None:
    manager = create_manager(private_key, rpc_url)

    print('Originating ctez...')
    ctez = originate_ctez(manager, metadata = ctez_metadata if with_metadata else None)
    print('Originating ctez_fa12...')
    ctez_fa12 = originate_ctez_fa12(manager, ctez, metadata = ctez_fa12_metadata if with_metadata else None)
    print('Setting ctez_fa12 address to ctez...')
    set_ctez_fa12_address(manager, ctez, ctez_fa12)

    print('ctez_address', get_address(ctez))
    print('ctez_fa12_address', get_address(ctez_fa12))
    
def originate_ctez(manager: PyTezosClient, metadata: Metadata) -> Ctez2:
    opg = Ctez2.originate(client=manager, last_update=manager.now(), metadata=metadata).send()
    manager.wait(opg)
    return Ctez2.from_opg(manager, opg)

def originate_ctez_fa12(manager: PyTezosClient, ctez: Ctez2, metadata: Metadata) -> Fa12:
    opg = Fa12.originate(client=manager, admin=get_address(ctez), metadata=metadata).send()
    manager.wait(opg)
    return Fa12.from_opg(manager, opg)

def set_ctez_fa12_address(manager: PyTezosClient, ctez: Ctez2, ctez_fa12: Fa12) -> None:
    opg = ctez.set_ctez_fa12_address(get_address(ctez_fa12)).send()
    manager.wait(opg)
