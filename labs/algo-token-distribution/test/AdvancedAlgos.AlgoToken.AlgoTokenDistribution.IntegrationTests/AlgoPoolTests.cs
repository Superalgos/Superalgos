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
    public class AlgoPoolTests
    {
        [Fact]
        public async Task MinerPoolTransferToMinerTest()
        {
            EthNetwork.UseGanacheTestNet();

            var prefundedAccount = new Account(EthNetwork.Instance.PrefundedPrivateKey);

            var tokenOwnerAccount = EthAccountFactory.Create();
            var coreTeamAccount = EthAccountFactory.Create();
            var minerAccounts = new IAccount[6];
            var referralAccounts = new IAccount[6];

            await EthNetwork.Instance.RefillAsync(tokenOwnerAccount);
            await EthNetwork.Instance.RefillAsync(coreTeamAccount);

            // Create the ERC20 token...
            var token = new AlgoTokenV1(EthNetwork.Instance.GetWeb3(tokenOwnerAccount), EthNetwork.Instance.GasPriceProvider);
            await token.DeployAsync();

            // Create a pool...
            var pool1 = new AlgoPool(EthNetwork.Instance.GetWeb3(coreTeamAccount), EthNetwork.Instance.GasPriceProvider);
            await pool1.DeployAsync(0, token.ContractAddress);

            // Transfer some tokens to the pool...
            await token.TransferAsync(pool1.ContractAddress, 100.MAlgo());

            // Create miners for each category...
            AlgoMiner[] miners = new AlgoMiner[6];

            for (byte i = 0; i <= 5; i++)
            {
                // Create an account for the miner and the referral...
                minerAccounts[i] = EthAccountFactory.Create();
                referralAccounts[i] = EthAccountFactory.Create();

                // Create the miner...
                miners[i] = new AlgoMiner(EthNetwork.Instance.GetWeb3(coreTeamAccount), EthNetwork.Instance.GasPriceProvider);
                await miners[i].DeployAsync(0, i, minerAccounts[i].Address, referralAccounts[i].Address, token.ContractAddress);
            }

            // Transfer tokens from the pool to the miners...
            for (int i = 0; i <= 5; i++)
            {
                await pool1.TrasferToMinerAsync(miners[i].ContractAddress);
            }

            // Ensure each miner received the proper amount of tokens according its category...
            Assert.Equal(100000.Algo(), await token.BalanceOfAsync(miners[0].ContractAddress));
            Assert.Equal(1.MAlgo(), await token.BalanceOfAsync(miners[1].ContractAddress));
            Assert.Equal(2.MAlgo(), await token.BalanceOfAsync(miners[2].ContractAddress));
            Assert.Equal(3.MAlgo(), await token.BalanceOfAsync(miners[3].ContractAddress));
            Assert.Equal(4.MAlgo(), await token.BalanceOfAsync(miners[4].ContractAddress));
            Assert.Equal(5.MAlgo(), await token.BalanceOfAsync(miners[5].ContractAddress));
        }

        [Fact]
        public async Task ReferralPoolTransferToMinerTest()
        {
            EthNetwork.UseGanacheTestNet();

            var prefundedAccount = new Account(EthNetwork.Instance.PrefundedPrivateKey);

            var tokenOwnerAccount = EthAccountFactory.Create();
            var coreTeamAccount = EthAccountFactory.Create();
            var minerAccounts = new IAccount[6];
            var referralAccounts = new IAccount[6];

            await EthNetwork.Instance.RefillAsync(tokenOwnerAccount);
            await EthNetwork.Instance.RefillAsync(coreTeamAccount);

            // Create the ERC20 token...
            var token = new AlgoTokenV1(EthNetwork.Instance.GetWeb3(tokenOwnerAccount), EthNetwork.Instance.GasPriceProvider);
            await token.DeployAsync();

            // Create a pool...
            var pool1 = new AlgoPool(EthNetwork.Instance.GetWeb3(coreTeamAccount), EthNetwork.Instance.GasPriceProvider);
            await pool1.DeployAsync(1, token.ContractAddress);

            // Transfer some tokens to the pool...
            await token.TransferAsync(pool1.ContractAddress, 100.MAlgo());

            // Create miners for each category...
            AlgoMiner[] miners = new AlgoMiner[6];

            for (byte i = 0; i <= 5; i++)
            {
                // Create an account for the miner and the referral...
                minerAccounts[i] = EthAccountFactory.Create();
                referralAccounts[i] = EthAccountFactory.Create();

                // Create the miner...
                miners[i] = new AlgoMiner(EthNetwork.Instance.GetWeb3(coreTeamAccount), EthNetwork.Instance.GasPriceProvider);
                await miners[i].DeployAsync(0, i, minerAccounts[i].Address, referralAccounts[i].Address, token.ContractAddress);
            }

            // Transfer tokens from the pool to the miners...
            for (int i = 0; i <= 5; i++)
            {
                await pool1.TrasferToMinerAsync(miners[i].ContractAddress);
            }

            // Ensure each miner received the proper amount of tokens according its category...
            Assert.Equal(100000.Algo() * 10 / 100, await token.BalanceOfAsync(miners[0].ContractAddress));
            Assert.Equal(1.MAlgo() * 10 / 100, await token.BalanceOfAsync(miners[1].ContractAddress));
            Assert.Equal(2.MAlgo() * 10 / 100, await token.BalanceOfAsync(miners[2].ContractAddress));
            Assert.Equal(3.MAlgo() * 10 / 100, await token.BalanceOfAsync(miners[3].ContractAddress));
            Assert.Equal(4.MAlgo() * 10 / 100, await token.BalanceOfAsync(miners[4].ContractAddress));
            Assert.Equal(5.MAlgo() * 10 / 100, await token.BalanceOfAsync(miners[5].ContractAddress));
        }
    }
}
