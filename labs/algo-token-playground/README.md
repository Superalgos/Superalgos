# AlgoToken Playground

## Building the application

1. Download and install the netcore 2.1 SDK from <https://dotnet.microsoft.com/download>
1. Build the application running the proper build script located in the `build` directory (`/labs/algo-token-playground/build`) according to your OS
1. The compiled binaries will be located in the `release/{platform}` directory 
1. Once the application is compiled, the generated binaries do not require the netcore SDK to run. All dependencies, including the netcore runtime, are included in the generated directory.

## Running the application

* Run the application by executing proper binary file for your OS. The file name is `AdvancedAlgos.AlgoToken.AlgoTokenPlayground` plus the `.exe` extension on Windows.

## Using the application

### Environment

By default the application is configured to run using the following configuration:

* Eth Network URL: `http://127.0.0.1:8545`
* Gas Price: `20Gwei`

You can check the configuration by running the command `list-env`.

* Use the command `set-network <url>` to change the current network.
* Use the command `set-gasprice <value>` to change the gas price used for the transactions. The value is expected in Gweis.

### Using Ganache to emulate a local testnet

You can emulate a local testnet by installing Ganache in your machine.

* Download and install the Ganache application from <https://truffleframework.com/ganache>
  * Ensure you set the port to 8545, which is the default port for GETH nodes
  * Ensure you disable the setting "ERROR ON TRANSACTION FAILURE" to emulate the behavior of the GETH client
  * Ensure you disable the setting "LOCK ACCOUNTS" to avoid locking the prefunded accounts
* If you prefer the command line version, you need to install nodejs and then you can use the scripts located in `/labs/tools/ganache-cli-setup` to install and run the application
  * The Windows version of the script expect the directory `C:\Temp` to be available for the Ganache DB
  * The Linux version of the script expect the directory `ganache-db` to be available in the current directory for the Ganache DB
  * You can change the Ganache DB directory by using the `--db` switch

### Managing accounts

#### Creating a new account

Use the `new-account [-n <account_name>]` command to create a new account.

The optional `-n` switch let you set a friendly name for the new account, later can be used as an alias for the account address when is necessary.

>Example: `new-account -n miner_1_account`

#### Importing an existing account

Use the command `import-account <private_key> [-n <account_name>]` to import an existing account.

>Example: `import-account 0936af475d2701538aad321f87e0a51f2b297634653393e8cab7290a674009a5 -n prefunded`

#### Selecting an account for singing transactions

Before executing any transaction, you need to set the account to be used for signing the transaction.

Use the `set-account <account>` command to set the signing account. All subsequent transactions will be signed using this account.

>Example: `set-account miner_1_account`

The `new-account` and `import-account` commands will set the current account automatically.

Notice that the current account name is shown in the command prompt.

#### Listing the accounts registered in the playground

The `list-accounts` command shows the list of accounts registered in the Playground.

>Example: `list-accounts`

### Ether management

Before using an account to sing a transaction you need to send some ethers to that account.

#### Transfer ethers to an account

Use the `eth-transfer <to> <value>` command to transfer ethers to an account:
* `to`: the destination account address (or name if the account is registered in the playground)
* `value`: the amount to transfer. By default this value is expected in weis, you can specify the following suffixes to use a different unit:
  * `wei`: base unit
  * `gwei`: 1000000000 weis
  * `ether` or `eth`: 1000000000000000000 weis
  * `mether` or `m`: 1000000000000000000000000 weis or 1M eth

>Example: `eth-transfer miner_1_account 1eth`

#### Getting the balance of an account

Use the `eth-getbalance <account>` command to get the balance of the specified account.

>Example: `eth-getbalance miner_1_account`

### Using aliases

The playground support aliases for account or contract addresses, in every place where an address is expected, the name given to the account or the contract can be used in place. Notice that this is an internal feature of the playground, neither accounts or contracts register this name in Ethereum.

Some commands allow you to specify an alias, for example when an account is created or when a contract is deployed.

Usually the `-n <account_name>` switch is the standard way to create an alias for an address. If you omit the switch the command will set an alias automatically.

Valid chars for alias identifiers are any char except reserved chars.

### Working with contracts

#### Deploying contracts

Ensure the current account is set before invoking a transaction (see `set-account` command).

Every contract provides an specific command to deploy a new instance of the contract, the pattern used by the playground is `deploy-<contract_name>`, followed by the constructor parameters if they are required by the contract. Also the `-n <account_name>` switch is avaible to create an alias for the new instance address.

To list the contracts created during the playground session use the command `list-contracts`.

#### Invoking a transactional operation

In order to invoke transactional operations, the pattern used is:

`<contract>.<operation> <parameters>`

Where `contract` is the contract address or an alias, the `operation` is the function you are calling, and `<parameters>` is the list of parameters required by the operation, separated by spaces.

String type parameters can be enclosed in double quotes, but is not mandatory, unless the string contains a reserved char. 

#### Invoking a call function

The invoke syntax is the same used for transactional operations, the only difference is that the current account is not used, since the call functions do not need to be signed.

#### Creating an alias for an contract address

Use the command `register-contract <address> <name>` to create an alias for an existing contract address:
* `address`: the address of the contract 
* `name`: the alias name for the specified contract address

## Algo Contracts

The detailed specification of the following contracts can be found in the "Smart Contracts Requirements / Specifications" document.

The goal of this document is to describe the commands available in the playground. For the behavior/business rules check the mentioned document.

### AlgoToken

AlgoToken is an standard ERC20 token contract. All available functions belong the ERC20 specification.

The following commands are supported for the `AlgoToken` contract:

#### deploy-algotoken

`deploy-algotoken [-n <contract_name>]`

Creates a new instance of the `AlgoToken` contract.

>Example: `deploy-algotoken -n token`

#### algotoken-transfer

`<contract>.algotoken-transfer <to> <value>`

Transfer tokens to the specified address:
* `to`: the destination account address 
* `value`: the amount to transfer

*These parameters follow the same rules listed in the `eth-transfer` command.*

>Example: `token.algotoken-transfer dev_pool 100m`

#### algotoken-balanceof

`<contract>.algotoken-balanceof <owner>`

Get the balance for the specified address:
* `owner`: the account address to check

>Example: `token.algotoken-balanceof dev_pool`

#### algotoken-pause

`<contract>.algotoken-pause`

Pauses the token. All transactions will be suspended.

>Example: `token.algotoken-pause`

#### algotoken-unpause

`<contract>.algotoken-unpause`

Unpauses the token. All transactions will be resumed.

>Example: `token.algotoken-unpause`

### AlgoPool

The following commands are supported for the `AlgoPool` contract:

#### deploy-algopool

`deploy-algopool <poolType> <tokenAddress> [-n <contract_name>]`

Creates a new instance of the `AlgoPool` contract.
* `poolType`: the type of pool (uint8: 0 = MinerPool, 1 = ReferralPool)
* `tokenAddress`: the address of the AlgoToken contract

>Example: `deploy-algopool 0 token -n dev_pool`

#### algopool-transfertominer

`<contract>.algopool-transfertominer <minerAddress>`

Transfer tokens from the AlgoPool balance to the AlgoMiner balance. The amount of tokens to be transfered is determined by the AlgoMiner category (see the specification document).
* `minerAddress`: the address of the AlgoMiner contract

>Example: `dev_pool.algopool-transfertominer miner_1`

#### algopool-terminate

`<contract>.algopool-terminate`

Terminates the contract and return its balance to the creator.

>Example: `dev_pool.algopool-terminate`

### AlgoMiner

The following commands are supported for the `AlgoMiner` contract:

#### deploy-algominer

`deploy-algominer <minerType> <category> <minerAccountAddress> <referralAccountAddress> <tokenAddress> [-n <contract_name>]`

Creates a new instance of the `AlgoPool` contract.
* `minerType`: the type of miner (uint8: 0 = PoolBased, 1 = NonPoolBased)
* `category`: the category of miner (uint8: valid from 0 to 5)
* `minerAccountAddress`: the address of the miner's owner
* `referralAccountAddress`: the address of the referral
* `tokenAddress`: the address of the AlgoToken contract

>Example: `deploy-algominer 0 2 miner_1_account referral_1_account token -n miner_1`

#### algominer-activateminer

`<contract>.algominer-activateminer`

Activates the miner.

>Example: `miner_1.algominer-activateminer`

#### algominer-deactivateminer

`<contract>.algominer-deactivateminer`

Deactivates the miner.

>Example: `miner_1.algominer-deactivateminer`

#### algominer-migrateminer

`<contract>.algominer-migrateminer <newMinerAddress>`

Transfer all tokens from this AlgoMiner another AlgoMiner. The miner must be deactivated before running this operation
* `newMinerAddress`: the address of the new AlgoMiner contract

>Example: `miner_1.algominer-migrateminer miner_2`

#### algominer-pausemining

`<contract>.algominer-pausemining`

Pauses the miner.

>Example: `miner_1.algominer-pausemining`

#### algominer-resumemining

`<contract>.algominer-resumemining`

Resumes the miner.

>Example: `miner_1.algominer-resumemining`

#### algominer-stopandremoveownership

`<contract>.algominer-stopandremoveownership`

Sets the miner to the stopped state and remove the ownership, a new owner and referral will be assigned using the `resetMiner` operation.

>Example: `miner_1.algominer-stopandremoveownership`

#### algominer-resetminer

`<contract>.algominer-resetminer <newOwnerAddress> <newReferralAddress>`

Resets the miner.
* `newOwnerAddress`: the address of the new owner
* `newReferralAddress`: the address of the new referral

>Example: `miner_1.algominer-resetminer`

#### algominer-startmining

`<contract>.algominer-startmining`

Starts the miner (used by the owner).

>Example: `miner_1.algominer-startmining`

#### algominer-stopmining

`<contract>.algominer-stopmining`

Stops the miner (used by the owner).

>Example: `miner_1.algominer-stopmining`

#### algominer-mine

`<contract>.algominer-mine`

This operation is executed by the system to request a payment from the AlgoMiner to the owner. The amount to pay is computed using the rules specified in the "Smart Contracts Requirements / Specifications" document.

>Example: `miner_1.algominer-mine`

#### algominer-terminate

`<contract>.algominer-terminate`

Terminates the contract and return its balance to the creator.

>Example: `miner_1.algominer-terminate`

#### algominer-addsystem

`<contract>.algominer-addsystem <account>`

Adds the specified account to the "System" role.
* `account`: the address of account to be added to the role.

>Example: `miner_1.algominer-addsystem 0x862f8938949e4A1aA82Cd427d87E4fc76940e7a1`

#### algominer-addcoreteam

`<contract>.algominer-addcoreteam <account>`

Adds the specified account to the "Core Team" role.
* `account`: the address of account to be added to the role.

>Example: `miner_1.algominer-addcoreteam 0x862f8938949e4A1aA82Cd427d87E4fc76940e7a1`

#### algominer-addsupervisor

`<contract>.algominer-addsupervisor <account>`

Adds the specified account to the "Supervisor" role.
* `account`: the address of account to be added to the role.

>Example: `miner_1.algominer-addsupervisor 0x862f8938949e4A1aA82Cd427d87E4fc76940e7a1`

### AlgoFees

The following commands are supported for the `AlgoFees` contract:

#### deploy-algofees

`deploy-algofees <tokenAddress> [-n <contract_name>]`

Creates a new instance of the `AlgoFees` contract.
* `tokenAddress`: the address of the AlgoToken contract

>Example: `deploy-algofees token -n fees1`

#### algofees-registerminer

`<contract>.algofees-registerminer <minerAddress>`

Registers a miner with the AlgoFees.
* `minerAddress`: the address of the AlgoMiner contract

>Example: `fees1.algofees-registerminer miner_0`

#### algofees-unregisterminer

`<contract>.algofees-unregisterminer <minerAddress>`

Unregisters a miner from the AlgoFees.
* `minerAddress`: the address of the AlgoMiner contract

>Example: `fees1.algofees-unregisterminer miner_0`

#### algofees-mine

`<contract>.algofees-mine`

This operation is executed by the system to request a payment from the AlgoFees to registered miners. The amount to pay is computed using the rules specified in the "Smart Contracts Requirements / Specifications" document.

>Example: `fees1.algofees-mine`

#### algominer-terminate

`<contract>.algofees-terminate`

Terminates the contract and return its balance to the creator.

>Example: `algofees.algofees-terminate`

### System commands

#### reset

Resets the current playground instance, removing all aliases created.

>Example: `reset`

### Notes

* Reserved chars: the following chars are reserved chars and cannot be used in identifiers or strings not enclosed in quotes: "space" ":" "/" "-" "." ","
* Commands, operations and identifiers are case insensitive
