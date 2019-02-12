using System;
using System.Numerics;
using System.Threading.Tasks;
using AdvancedAlgos.AlgoToken.AlgoErc20Token;
using AdvancedAlgos.AlgoToken.Framework.Ethereum;
using AdvancedAlgos.AlgoToken.Framework.Ethereum.Exceptions;
using AdvancedAlgos.AlgoToken.Framework.Ethereum.IntegrationTest;
using Nethereum.RPC.Accounts;
using Nethereum.Web3;
using Nethereum.Web3.Accounts;
using Xunit;

namespace AdvancedAlgos.AlgoToken.AlgoTokenDistribution.IntegrationTests
{
    public class AlgoFeesTests
    {
        [Fact]
        public async Task MinerRegistrationTest()
        {
            EthNetwork.UseDefaultTestNet();

            var prefundedAccount = new Account(EthNetwork.Instance.PrefundedPrivateKey);

            var tokenOwnerAccount = EthAccountFactory.Create();
            var coreTeamAccount = EthAccountFactory.Create();

            await EthNetwork.Instance.RefillAsync(tokenOwnerAccount);
            await EthNetwork.Instance.RefillAsync(coreTeamAccount);

            // Create the ERC20 token...
            var token = new AlgoTokenV1(EthNetwork.Instance.GetWeb3(tokenOwnerAccount), EthNetwork.Instance.GasPriceProvider);
            await token.DeployAsync();

            // Create a fees...
            var fees1 = new AlgoFees(EthNetwork.Instance.GetWeb3(coreTeamAccount), EthNetwork.Instance.GasPriceProvider);
            await fees1.DeployAsync(token.ContractAddress);

            // Create some miners...
            var minerAccounts = new IAccount[3];
            var referralAccounts = new IAccount[3];
            AlgoMiner[] miners = new AlgoMiner[3];

            for (int i = 0; i < 3; i++)
            {
                // Create an account for the miner and the referral...
                minerAccounts[i] = EthAccountFactory.Create();
                referralAccounts[i] = EthAccountFactory.Create();

                // Create the miner...
                miners[i] = new AlgoMiner(EthNetwork.Instance.GetWeb3(coreTeamAccount), EthNetwork.Instance.GasPriceProvider);
                await miners[i].DeployAsync(0, 2, minerAccounts[i].Address, referralAccounts[i].Address, token.ContractAddress);
            }

            // Register a miner...
            await fees1.RegisterMinerAsync(miners[0].ContractAddress);

            Assert.Equal(1, await fees1.GetMinerCountAsync());
            Assert.Equal(miners[0].ContractAddress, await fees1.GetMinerByIndexAsync(0));

            // Remove the only registered miner.
            await fees1.UnregisterMinerAsync(miners[0].ContractAddress);

            Assert.Equal(0, await fees1.GetMinerCountAsync());

            // Register the 3 miners and ensure they are registered...
            for (int i = 0; i < 3; i++)
            {
                await fees1.RegisterMinerAsync(miners[i].ContractAddress);
            }

            Assert.Equal(3, await fees1.GetMinerCountAsync());

            for (int i = 0; i < 3; i++)
            {
                Assert.Equal(miners[i].ContractAddress, await fees1.GetMinerByIndexAsync(i));
            }

            // Remove the 2nd miner and check...
            await fees1.UnregisterMinerAsync(miners[1].ContractAddress);

            Assert.Equal(2, await fees1.GetMinerCountAsync());
            Assert.Equal(miners[0].ContractAddress, await fees1.GetMinerByIndexAsync(0));
            Assert.Equal(miners[2].ContractAddress, await fees1.GetMinerByIndexAsync(1));

            // Add the removed miner back...
            await fees1.RegisterMinerAsync(miners[1].ContractAddress);

            Assert.Equal(3, await fees1.GetMinerCountAsync());
            Assert.Equal(miners[0].ContractAddress, await fees1.GetMinerByIndexAsync(0));
            Assert.Equal(miners[2].ContractAddress, await fees1.GetMinerByIndexAsync(1));
            Assert.Equal(miners[1].ContractAddress, await fees1.GetMinerByIndexAsync(2));

            // Remove the latest miner...
            await fees1.UnregisterMinerAsync(miners[1].ContractAddress);

            Assert.Equal(2, await fees1.GetMinerCountAsync());
            Assert.Equal(miners[0].ContractAddress, await fees1.GetMinerByIndexAsync(0));
            Assert.Equal(miners[2].ContractAddress, await fees1.GetMinerByIndexAsync(1));
        }

        [Fact]
        public async Task MineTest()
        {
            EthNetwork.UseDefaultTestNet();

            var prefundedAccount = new Account(EthNetwork.Instance.PrefundedPrivateKey);

            var tokenOwnerAccount = EthAccountFactory.Create();
            var systemAccount = EthAccountFactory.Create();
            var coreTeamAccount = EthAccountFactory.Create();

            await EthNetwork.Instance.RefillAsync(tokenOwnerAccount);
            await EthNetwork.Instance.RefillAsync(systemAccount);
            await EthNetwork.Instance.RefillAsync(coreTeamAccount);

            // Create the ERC20 token...
            var token = new AlgoTokenV1(EthNetwork.Instance.GetWeb3(tokenOwnerAccount), EthNetwork.Instance.GasPriceProvider);
            await token.DeployAsync();

            // Create a fees...
            var fees1 = new AlgoFees(EthNetwork.Instance.GetWeb3(coreTeamAccount), EthNetwork.Instance.GasPriceProvider);
            await fees1.DeployAsync(token.ContractAddress);

            // Register the system account...
            await fees1.AddSystemAsync(systemAccount.Address);

            // Transfer some tokens to the fees...
            await token.TransferAsync(fees1.ContractAddress, 151.Algo());

            // Create one miner per category...
            var minerAccounts = new IAccount[6];
            var referralAccounts = new IAccount[6];
            var miners = new AlgoMiner[6];

            for (byte i = 0; i <= 5; i++)
            {
                // Create an account for the miner and the referral...
                minerAccounts[i] = EthAccountFactory.Create();
                referralAccounts[i] = EthAccountFactory.Create();
                await EthNetwork.Instance.RefillAsync(minerAccounts[i]);

                // Create the miner as "NonPoolBased" so it can be activated...
                miners[i] = new AlgoMiner(EthNetwork.Instance.GetWeb3(coreTeamAccount), EthNetwork.Instance.GasPriceProvider);
                await miners[i].DeployAsync(1, i, minerAccounts[i].Address, referralAccounts[i].Address, token.ContractAddress);

                // Activate the miner...
                await miners[i].ActivateMinerAsync();

                // Start mining...
                {
                    var miner = new AlgoMiner(miners[i].ContractAddress, EthNetwork.Instance.GetWeb3(minerAccounts[i]), EthNetwork.Instance.GasPriceProvider);
                    await miner.StartMiningAsync();
                }

                // Register a miner...
                await fees1.RegisterMinerAsync(miners[i].ContractAddress);
            }

            // Mine the fees...
            {
                var fees = new AlgoFees(fees1.ContractAddress, EthNetwork.Instance.GetWeb3(systemAccount), EthNetwork.Instance.GasPriceProvider);
                await fees.MineAsync();
            }

            // Ensure the miners received the payment from the fees...
            var balance0 = await token.BalanceOfAsync(minerAccounts[0].Address);
            var balance1 = await token.BalanceOfAsync(minerAccounts[1].Address);
            var balance2 = await token.BalanceOfAsync(minerAccounts[2].Address);
            var balance3 = await token.BalanceOfAsync(minerAccounts[3].Address);
            var balance4 = await token.BalanceOfAsync(minerAccounts[4].Address);
            var balance5 = await token.BalanceOfAsync(minerAccounts[5].Address);

            Assert.Equal(1.Algo(), balance0);
            Assert.Equal(10.Algo(), balance1);
            Assert.Equal(20.Algo(), balance2);
            Assert.Equal(30.Algo(), balance3);
            Assert.Equal(40.Algo(), balance4);
            Assert.Equal(50.Algo(), balance5);
        }

        [Fact]
        public async Task TerminateTest()
        {
            EthNetwork.UseDefaultTestNet();

            var prefundedAccount = new Account(EthNetwork.Instance.PrefundedPrivateKey);

            var tokenOwnerAccount = EthAccountFactory.Create();
            var coreTeamAccount = EthAccountFactory.Create();

            await EthNetwork.Instance.RefillAsync(tokenOwnerAccount);
            await EthNetwork.Instance.RefillAsync(coreTeamAccount);

            // Create the ERC20 token...
            var token = new AlgoTokenV1(EthNetwork.Instance.GetWeb3(tokenOwnerAccount), EthNetwork.Instance.GasPriceProvider);
            await token.DeployAsync();

            // Store the current balance of the token owner...
            var tokenOwnerAccountBalance = await token.BalanceOfAsync(tokenOwnerAccount.Address);

            // Create a fees...
            var fees1 = new AlgoFees(EthNetwork.Instance.GetWeb3(coreTeamAccount), EthNetwork.Instance.GasPriceProvider);
            await fees1.DeployAsync(token.ContractAddress);

            // Transfer some tokens to the fees...
            await token.TransferAsync(fees1.ContractAddress, 100.Algo());

            // Ensure the receiver got the tokens...
            Assert.Equal(100.Algo(), await token.BalanceOfAsync(fees1.ContractAddress));

            // Terminate the contract.
            await fees1.TerminateAsync();

            // Ensure the contract returned all the tokens...
            Assert.Equal(0, await token.BalanceOfAsync(fees1.ContractAddress));
            Assert.Equal(100.Algo(), await token.BalanceOfAsync(coreTeamAccount.Address));
        }
    }
}
