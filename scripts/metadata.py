base_template = {
    'version': '2.0.0',
    'interfaces': ['TZIP-016'], 
    'license': {'name': 'MIT'},
    'homepage': 'https://github.com/tezos-checker/ctez', 
}

ctez_fa12_metadata = base_template | {
    'name': 'Ctez FA12',
    'interfaces': [
        'TZIP-007',
        'TZIP-016'
    ]
}

ctez_metadata = base_template | {
    'name': 'Ctez',
}
