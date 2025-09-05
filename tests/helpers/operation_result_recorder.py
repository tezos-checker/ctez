import json
from pytezos.operation.result import OperationResult
from pytezos.operation.group import OperationGroup
from pytezos.client import PyTezosClient
from tests.helpers.utility import find_op_by_hash, get_consumed_mutez

class OperationResultRecorder:
    def __init__(self):
        self.data = {}

    def add_element(self, client: PyTezosClient, key: str, op : OperationGroup):
        opg = find_op_by_hash(client, op)

        if key in self.data:
            raise KeyError(f'The key \'{key}\' already recorded')
        
        value = {
            'consumed_gas': OperationResult.consumed_gas(opg),
            'consumed_mutez': get_consumed_mutez(client, op),
            'paid_storage_size_diff': OperationResult.paid_storage_size_diff(opg),
        }
        self.data[key] = value

    def write_to_file(self, filename: str):
        with open(filename, 'w') as f:
            json.dump(self.data, f, indent=4)
