LIGO_VERSION = 1.6.0
LIGO_COMPILER = docker run --rm -v "${PWD}":"${PWD}" -w "${PWD}" ligolang/ligo:${LIGO_VERSION}
OUTPUT_FOLDER = build

compile:
	rm -r -f ./${OUTPUT_FOLDER} 
	mkdir ./${OUTPUT_FOLDER}
	${LIGO_COMPILER} compile contract contracts/fa12.mligo -o ${OUTPUT_FOLDER}/fa12.tz
	${LIGO_COMPILER} compile contract contracts/ctez/ctez_2.mligo -o ${OUTPUT_FOLDER}/ctez_2.tz
	${LIGO_COMPILER} compile contract tests/helpers/contracts/fa12/fa12_tester.mligo -o tests/helpers/contracts/fa12/fa12_tester.tz
