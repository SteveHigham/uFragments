#!/usr/bin/env bash
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
PROJECT_DIR=$DIR/../

# Exit script as soon as a command fails.
set -o errexit

process-pid(){
  lsof -t -i:$1
}

run-unit-tests(){
  npx truffle \
    --network $1 \
    test \
    $PROJECT_DIR/test/unit/*.js
}

run-test(){
  echo "-------Run test with args: " $*
  npx truffle test $*
}

read REF PORT < <(npx get-network-config "ganacheUnitTest")

if [ $(process-pid $PORT) ]
then
  REFRESH=0
else
  REFRESH=1
  echo "------Start blockchain(s)"
  npx start-chain "ganacheUnitTest"
fi

cleanup(){
  if [ "$REFRESH" == "1" ]
  then
    npx stop-chain $1
  fi
}
trap cleanup EXIT


if [ $# -eq 0 ]
then
  echo "No arguments - run all tests"
  run-unit-tests "ganacheUnitTest"
else
  echo "Arguments: " $*
  run-test $*
fi

exit 0
