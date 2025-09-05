from math import floor
from typing import Optional
import click

from scripts.helpers import create_manager, get_balance_mutez
from tests.helpers.addressable import get_address
from tests.helpers.contracts.ctez2.ctez2 import Ctez2
from tests.helpers.contracts.fa12.fa12 import Fa12
from random import randrange, uniform

@click.command()
@click.option('--ctez-address', required=True)
@click.option('--oven-id', required=True, type=int)
@click.option('--deposit', default=0, type=int)
@click.option('--delegate', default=None)
@click.option('--private-key', default=None, help='Use the provided private key.')
@click.option('--rpc-url', default=None, help='Tezos RPC URL.')
def create_oven(
    ctez_address: str,
    oven_id: int,
    deposit: Optional[str],
    delegate: Optional[str],
    private_key: Optional[str],
    rpc_url: Optional[str],
) -> None:
    manager = create_manager(private_key, rpc_url)
    ctez2 = Ctez2.from_address(manager, ctez_address)
    print('Creating oven...')
    opg = ctez2.create_oven(oven_id, delegate, depositors=None).with_amount(deposit).send()
    manager.wait(opg)
    print(f'Operation has been completed: {opg.opg_hash}')

@click.command()
@click.option('--ctez-address', required=True)
@click.option('--oven-id', required=True, type=int)
@click.option('--deposit', required=True, type=int)
@click.option('--private-key', default=None, help='Use the provided private key.')
@click.option('--rpc-url', default=None, help='Tezos RPC URL.')
def deposit(
    ctez_address: str,
    oven_id: int,
    deposit: int,
    private_key: Optional[str],
    rpc_url: Optional[str],
) -> None:
    manager = create_manager(private_key, rpc_url)
    ctez2 = Ctez2.from_address(manager, ctez_address)
    oven = ctez2.get_oven_contract(manager, manager, oven_id)
    print('Depositing to oven...')
    opg = oven.deposit().with_amount(deposit).send()
    manager.wait(opg)
    print(f'Operation has been completed: {opg.opg_hash}')

@click.command()
@click.option('--ctez-address', required=True)
@click.option('--oven-id', required=True, type=int)
@click.option('--amount', required=True, type=int)
@click.option('--to-address', default=None)
@click.option('--private-key', default=None, help='Use the provided private key.')
@click.option('--rpc-url', default=None, help='Tezos RPC URL.')
def withdraw(
    ctez_address: str,
    oven_id: int,
    amount: int,
    to_address: str,
    private_key: Optional[str],
    rpc_url: Optional[str],
) -> None:
    manager = create_manager(private_key, rpc_url)
    to_address = to_address if to_address is not None else get_address(manager)
    ctez2 = Ctez2.from_address(manager, ctez_address)
    print('Withdrawing from oven...')
    opg = ctez2.withdraw_from_oven(oven_id, amount, to_address).send()
    manager.wait(opg)
    print(f'Operation has been completed: {opg.opg_hash}')

@click.command()
@click.option('--ctez-address', required=True)
@click.option('--oven-id', required=True, type=int)
@click.option('--quantity', required=True, type=int)
@click.option('--private-key', default=None, help='Use the provided private key.')
@click.option('--rpc-url', default=None, help='Tezos RPC URL.')
def mint_or_burn(
    ctez_address: str,
    oven_id: int,
    quantity: int,
    private_key: Optional[str],
    rpc_url: Optional[str],
) -> None:
    manager = create_manager(private_key, rpc_url)
    ctez2 = Ctez2.from_address(manager, ctez_address)
    print('Minting or burning in oven...')
    opg = ctez2.mint_or_burn(oven_id, quantity).send()
    manager.wait(opg)
    print(f'Operation has been completed: {opg.opg_hash}')

@click.command()
@click.option('--ctez-address', required=True)
@click.option('--oven-owner-address', required=True)
@click.option('--oven-id', required=True, type=int)
@click.option('--quantity', required=True, type=int)
@click.option('--to-address', default=None)
@click.option('--private-key', default=None, help='Use the provided private key.')
@click.option('--rpc-url', default=None, help='Tezos RPC URL.')
def liquidate(
    ctez_address: str,
    oven_owner_address: str,
    oven_id: int,
    quantity: int,
    to_address: str,
    private_key: Optional[str],
    rpc_url: Optional[str],
) -> None:
    manager = create_manager(private_key, rpc_url)
    to_address = to_address if to_address is not None else get_address(manager)
    ctez2 = Ctez2.from_address(manager, ctez_address)
    print('Liquidating oven...')
    opg = ctez2.liquidate_oven(oven_owner_address, oven_id, quantity, to_address).send()
    manager.wait(opg)
    print(f'Operation has been completed: {opg.opg_hash}')

@click.command()
@click.option('--ctez-address', required=True)
@click.option('--amount', required=True, type=int)
@click.option('--owner-address', default=None)
@click.option('--private-key', default=None, help='Use the provided private key.')
@click.option('--rpc-url', default=None, help='Tezos RPC URL.')
def add_ctez_liquidity(
    ctez_address: str,
    amount: int,
    owner_address: Optional[str],
    private_key: Optional[str],
    rpc_url: Optional[str],
) -> None:
    manager = create_manager(private_key, rpc_url)
    owner_address = owner_address if owner_address is not None else get_address(manager)
    ctez2 = Ctez2.from_address(manager, ctez_address)
    ctez_token = Fa12.from_address(manager, ctez2.get_ctez_fa12_address())
    deadline = manager.now() + 1000
    print('Adding ctez liquidity...')
    
    opg = manager.bulk(
        ctez_token.approve(ctez2, 0),
        ctez_token.approve(ctez2, amount),
        ctez2.add_ctez_liquidity(owner_address, amount, 0, deadline)
    ).send()
    manager.wait(opg)
    print(f'Operation has been completed: {opg.opg_hash}')

@click.command()
@click.option('--ctez-address', required=True)
@click.option('--amount', required=True, type=int)
@click.option('--owner-address', default=None)
@click.option('--private-key', default=None, help='Use the provided private key.')
@click.option('--rpc-url', default=None, help='Tezos RPC URL.')
def add_tez_liquidity(
    ctez_address: str,
    amount: int,
    owner_address: Optional[str],
    private_key: Optional[str],
    rpc_url: Optional[str],
) -> None:
    manager = create_manager(private_key, rpc_url)
    owner_address = owner_address if owner_address is not None else get_address(manager)
    ctez2 = Ctez2.from_address(manager, ctez_address)
    deadline = manager.now() + 1000
    print('Adding tez liquidity...')
    
    opg = ctez2.add_tez_liquidity(owner_address, 0, deadline).with_amount(amount).send()
    manager.wait(opg)
    print(f'Operation has been completed: {opg.opg_hash}')

@click.command()
@click.option('--ctez-address', required=True)
@click.option('--to-address', default=None)
@click.option('--private-key', default=None, help='Use the provided private key.')
@click.option('--rpc-url', default=None, help='Tezos RPC URL.')
def collect_from_ctez_liquidity(
    ctez_address: str,
    to_address: Optional[str],
    private_key: Optional[str],
    rpc_url: Optional[str],
) -> None:
    manager = create_manager(private_key, rpc_url)
    to_address = to_address if to_address is not None else get_address(manager)
    ctez2 = Ctez2.from_address(manager, ctez_address)
    print('Collecting from ctez liquidity...')
    
    opg = ctez2.collect_from_ctez_liquidity(to_address).send()
    manager.wait(opg)
    print(f'Operation has been completed: {opg.opg_hash}')

@click.command()
@click.option('--ctez-address', required=True)
@click.option('--to-address', default=None)
@click.option('--private-key', default=None, help='Use the provided private key.')
@click.option('--rpc-url', default=None, help='Tezos RPC URL.')
def collect_from_tez_liquidity(
    ctez_address: str,
    to_address: Optional[str],
    private_key: Optional[str],
    rpc_url: Optional[str],
) -> None:
    manager = create_manager(private_key, rpc_url)
    to_address = to_address if to_address is not None else get_address(manager)
    ctez2 = Ctez2.from_address(manager, ctez_address)
    print('Collecting from tez liquidity...')
    
    opg = ctez2.collect_from_tez_liquidity(to_address).send()
    manager.wait(opg)
    print(f'Operation has been completed: {opg.opg_hash}')

@click.command()
@click.option('--ctez-address', required=True)
@click.option('--liquidity_amount', required=True, type=int)
@click.option('--to-address', default=None)
@click.option('--private-key', default=None, help='Use the provided private key.')
@click.option('--rpc-url', default=None, help='Tezos RPC URL.')
def remove_ctez_liquidity(
    ctez_address: str,
    liquidity_amount: int,
    to_address: Optional[str],
    private_key: Optional[str],
    rpc_url: Optional[str],
) -> None:
    manager = create_manager(private_key, rpc_url)
    to_address = to_address if to_address is not None else get_address(manager)
    ctez2 = Ctez2.from_address(manager, ctez_address)
    deadline = manager.now() + 1000
    print('Removing ctez liquidity...')
    
    opg = ctez2.remove_ctez_liquidity(to_address, liquidity_amount, 0, 0, 0, deadline).send()
    manager.wait(opg)
    print(f'Operation has been completed: {opg.opg_hash}')

@click.command()
@click.option('--ctez-address', required=True)
@click.option('--liquidity_amount', required=True, type=int)
@click.option('--to-address', default=None)
@click.option('--private-key', default=None, help='Use the provided private key.')
@click.option('--rpc-url', default=None, help='Tezos RPC URL.')
def remove_tez_liquidity(
    ctez_address: str,
    liquidity_amount: int,
    to_address: Optional[str],
    private_key: Optional[str],
    rpc_url: Optional[str],
) -> None:
    manager = create_manager(private_key, rpc_url)
    to_address = to_address if to_address is not None else get_address(manager)
    ctez2 = Ctez2.from_address(manager, ctez_address)
    deadline = manager.now() + 1000
    print('Removing tez liquidity...')
    
    opg = ctez2.remove_tez_liquidity(to_address, liquidity_amount, 0, 0, 0, deadline).send()
    manager.wait(opg)
    print(f'Operation has been completed: {opg.opg_hash}')

@click.command()
@click.option('--ctez-address', required=True)
@click.option('--ctez_amount', required=True, type=int)
@click.option('--to-address', default=None)
@click.option('--private-key', default=None, help='Use the provided private key.')
@click.option('--rpc-url', default=None, help='Tezos RPC URL.')
def ctez_to_tez(
    ctez_address: str,
    ctez_amount: int,
    to_address: Optional[str],
    private_key: Optional[str],
    rpc_url: Optional[str],
) -> None:
    manager = create_manager(private_key, rpc_url)
    to_address = to_address if to_address is not None else get_address(manager)
    ctez2 = Ctez2.from_address(manager, ctez_address)
    ctez_token = Fa12.from_address(manager, ctez2.get_ctez_fa12_address())
    deadline = manager.now() + 1000
    print('Swapping ctez to tez...')
    
    opg = manager.bulk(
        ctez_token.approve(ctez2, 0),
        ctez_token.approve(ctez2, ctez_amount),
        ctez2.ctez_to_tez(to_address, ctez_amount, 0, deadline)
    ).send()
    manager.wait(opg)
    print(f'Operation has been completed: {opg.opg_hash}')

@click.command()
@click.option('--ctez-address', required=True)
@click.option('--tez_amount', required=True, type=int)
@click.option('--to-address', default=None)
@click.option('--private-key', default=None, help='Use the provided private key.')
@click.option('--rpc-url', default=None, help='Tezos RPC URL.')
def tez_to_ctez(
    ctez_address: str,
    tez_amount: int,
    to_address: Optional[str],
    private_key: Optional[str],
    rpc_url: Optional[str],
) -> None:
    manager = create_manager(private_key, rpc_url)
    to_address = to_address if to_address is not None else get_address(manager)
    ctez2 = Ctez2.from_address(manager, ctez_address)
    deadline = manager.now() + 1000
    print('Swapping tez to ctez...')
    
    opg = ctez2.tez_to_ctez(to_address, 0, deadline).with_amount(tez_amount).send()
    manager.wait(opg)
    print(f'Operation has been completed: {opg.opg_hash}')

@click.command()
@click.option('--ctez-address', required=True)
@click.option('--delegate', default=None)
@click.option('--private-key', default=None, help='Use the provided private key.')
@click.option('--rpc-url', default=None, help='Tezos RPC URL.')
def execute_every_entrypoint(
    ctez_address: str,
    delegate: Optional[str],
    private_key: Optional[str],
    rpc_url: Optional[str],
) -> None:
    manager = create_manager(private_key, rpc_url)
    ctez2 = Ctez2.from_address(manager, ctez_address)
    sender_address = get_address(manager)
    oven_id = randrange(100_000_000_000)
    initial_deposit = randrange(1_000_000, 100_000_000)
    deadline = manager.now() + 100_000_000
    print(f'Creating oven #{oven_id} with deposit {initial_deposit} mutez ...')
    opg = ctez2.create_oven(oven_id, delegate, depositors=None).with_amount(initial_deposit).send()
    manager.wait(opg)
    print(f'Operation has been completed: {opg.opg_hash}')
    
    deposit = randrange(1_000_000, 100_000_000)
    print(f'Depositing {deposit} mutez...')
    oven = ctez2.get_oven_contract(manager, sender_address, oven_id)
    opg = oven.deposit().with_amount(deposit).send()
    manager.wait(opg)
    print(f'Operation has been completed: {opg.opg_hash}')
    
    target = ctez2.get_target() / 2**64
    mint_amount = floor(deposit * 15 / (target * 16))
    print(f'Minting {mint_amount} muctez')
    opg = ctez2.mint_or_burn(oven_id, mint_amount).send()
    manager.wait(opg)
    print(f'Operation has been completed: {opg.opg_hash}')

    add_ctez_liquidity_amount = floor(mint_amount / 2)
    print(f'Adding {add_ctez_liquidity_amount} to ctez liquidity...')
    ctez_token = Fa12.from_address(manager, ctez2.get_ctez_fa12_address())
    opg = manager.bulk(
        ctez_token.approve(ctez2, 0),
        ctez_token.approve(ctez2, add_ctez_liquidity_amount),
        ctez2.add_ctez_liquidity(sender_address, add_ctez_liquidity_amount, 0, deadline)
    ).send()
    manager.wait(opg)
    print(f'Operation has been completed: {opg.opg_hash}')

    add_tez_liquidity_amount = floor(add_ctez_liquidity_amount * target * uniform(0, 2))
    print(f'Adding {add_tez_liquidity_amount} to tez liquidity...')
    ctez_token = Fa12.from_address(manager, ctez2.get_ctez_fa12_address())
    opg = ctez2.add_tez_liquidity(sender_address, 0, deadline).with_amount(add_tez_liquidity_amount).send()
    manager.wait(opg)
    print(f'Operation has been completed: {opg.opg_hash}')

    ctez_amount_to_swap = min(floor(add_tez_liquidity_amount / (target * 1.06)), ctez_token.view_balance(sender_address))
    print(f'Swapping {ctez_amount_to_swap} ctez to tez...')
    opg = manager.bulk(
        ctez_token.approve(ctez2, 0),
        ctez_token.approve(ctez2, ctez_amount_to_swap),
        ctez2.ctez_to_tez(sender_address, ctez_amount_to_swap, 0, deadline)
    ).send()
    manager.wait(opg)
    print(f'Operation has been completed: {opg.opg_hash}')

    tez_amount_to_swap = min(floor(add_ctez_liquidity_amount * target / 1.06), get_balance_mutez(manager, sender_address))
    print(f'Swapping {tez_amount_to_swap} tez to ctez...')
    opg = ctez2.tez_to_ctez(sender_address, 0, deadline).with_amount(tez_amount_to_swap).send()
    manager.wait(opg)
    print(f'Operation has been completed: {opg.opg_hash}')

    print('Collecting from ctez liquidity...')
    opg = ctez2.collect_from_ctez_liquidity(sender_address).send()
    manager.wait(opg)
    print(f'Operation has been completed: {opg.opg_hash}')

    print('Collecting from tez liquidity...')
    opg = ctez2.collect_from_tez_liquidity(sender_address).send()
    manager.wait(opg)
    print(f'Operation has been completed: {opg.opg_hash}')

    print('Removing ctez liquidity...')
    opg = ctez2.remove_ctez_liquidity(sender_address, add_ctez_liquidity_amount, 0, 0, 0, deadline).send()
    manager.wait(opg)
    print(f'Operation has been completed: {opg.opg_hash}')

    print('Removing tez liquidity...')
    opg = ctez2.remove_tez_liquidity(sender_address, add_tez_liquidity_amount, 0, 0, 0, deadline).send()
    manager.wait(opg)
    print(f'Operation has been completed: {opg.opg_hash}')

    burn_amount = floor((mint_amount - add_ctez_liquidity_amount) / 2)
    print(f'Burning {burn_amount} muctez')
    opg = ctez2.mint_or_burn(oven_id, -burn_amount).send()
    manager.wait(opg)
    print(f'Operation has been completed: {opg.opg_hash}')

    withdraw_amount = floor(initial_deposit / 2)
    print(f'Withdraw {withdraw_amount} mutez from oven ...')
    opg = ctez2.withdraw_from_oven(oven_id, withdraw_amount, sender_address).send()
    manager.wait(opg)
    print(f'Operation has been completed: {opg.opg_hash}')
