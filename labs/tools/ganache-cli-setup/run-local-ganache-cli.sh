#!/bin/bash
ganache-cli "--mnemonic" "act analyst ability congress enter point unlock universe winner achieve refuse border" "--accounts" "2" "--defaultBalanceEther" "10000000" "--networkId" "777" "--db" "$PWD/ganache-db" "--deterministic" "--noVMErrorsOnRPCResponse"
