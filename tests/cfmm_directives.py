from subprocess import run

for cash in ["#define CASH_IS_TEZ", "#define CASH_IS_FA2", "#define CASH_IS_FA12"]:
    for token in ["", "#define TOKEN_IS_FA2"]:
        for baker in ["", "#define HAS_BAKER"]:
            for oracle in ["", "#define ORACLE"]:
                test_file = open('cfmm_directive_test_compilation.mligo', 'w')
                test_file.write('\n'.join([cash, token, baker, oracle, ""]))
                test_file.write('[@inline] let const_fee = 997n\n')
                test_file.write('[@inline] let const_fee_denom = 1000n\n')
                src_file = open('../cfmm.mligo','r')
                test_file.write(src_file.read())
                command = ["ligo", "measure-contract", "cfmm_directive_test_compilation.mligo", "main"]
                process = run(command, capture_output=True)
                print(process.stdout.decode('utf8'))
                print(process.stderr.decode('utf8'))
                command = ["rm", "cfmm_directive_test_compilation.mligo"]
                process = run(command)