using System;
using System.Numerics;
using System.Threading.Tasks;
using AdvancedAlgos.AlgoToken.AlgoErc20Token;
using AdvancedAlgos.AlgoToken.Framework.Ethereum;
using AdvancedAlgos.AlgoToken.Framework.Ethereum.Exceptions;
using AdvancedAlgos.AlgoToken.Framework.Ethereum.IntegrationTest;
using Nethereum.Web3;
using Nethereum.Web3.Accounts;
using Xunit;

namespace AdvancedAlgos.AlgoToken.AlgoTokenDistribution.IntegrationTests
{
    public class AlgoMinerTests
    {
        [Fact]
        public async Task PoolBasedMinerBasicWorkfloWTest()
        {
            EthNetwork.UseDefaultTestNet();

            var prefundedAccount = new Account(EthNetwork.Instance.PrefundedPrivateKey);

            var tokenOwnerAccount = EthAccountFactory.Create();
            var systemAccount = EthAccountFactory.Create();
            var coreTeamAccount = EthAccountFactory.Create();
            var supervisorAccount = EthAccountFactory.Create();
            var minerAccount = EthAccountFactory.Create();
            var referralAccount = EthAccountFactory.Create();

            await EthNetwork.Instance.RefillAsync(tokenOwnerAccount);
            await EthNetwork.Instance.RefillAsync(systemAccount);
            await EthNetwork.Instance.RefillAsync(coreTeamAccount);
            await EthNetwork.Instance.RefillAsync(supervisorAccount);
            await EthNetwork.Instance.RefillAsync(minerAccount);

            // Create the ERC20 token...
            var token = new AlgoTokenV1(EthNetwork.Instance.GetWeb3(tokenOwnerAccount), EthNetwork.Instance.GasPriceProvider);
            await token.DeployAsync();

            // Create the pools to transfer the proper number of tokens to the miners...
            var pool1 = new AlgoPool(EthNetwork.Instance.GetWeb3(coreTeamAccount), EthNetwork.Instance.GasPriceProvider);
            await pool1.DeployAsync(0, token.ContractAddress);
            var pool2 = new AlgoPool(EthNetwork.Instance.GetWeb3(coreTeamAccount), EthNetwork.Instance.GasPriceProvider);
            await pool2.DeployAsync(1, token.ContractAddress);

            // Transfer some tokens to the pools...
            await token.TransferAsync(pool1.ContractAddress, 100.MAlgo());
            await token.TransferAsync(pool2.ContractAddress, 100.MAlgo());

            // Create a miner category 2...
            var miner1 = new AlgoMiner(EthNetwork.Instance.GetWeb3(coreTeamAccount), EthNetwork.Instance.GasPriceProvider);
            await miner1.DeployAsync(0, 2, minerAccount.Address, referralAccount.Address, token.ContractAddress);

            // Add roles to the miner...
            await miner1.AddSystemAsync(systemAccount.Address);
            await miner1.AddSupervisorAsync(supervisorAccount.Address);

            // Transfer tokens to the miner...
            await pool1.TransferToMinerAsync(miner1.ContractAddress);
            await pool2.TransferToMinerAsync(miner1.ContractAddress);

            // Ensure the miner received the tokens according to its category 2.
            Assert.Equal(2.MAlgo() + 2.MAlgo() * 10 / 100, await token.BalanceOfAsync(miner1.ContractAddress));

            // Activate the miner...
            await miner1.ActivateMinerAsync();

            // Start mining...
            miner1.Bind(EthNetwork.Instance.GetWeb3(minerAccount));
            await miner1.StartMiningAsync();

            // Mine 5 days...
            miner1.Bind(EthNetwork.Instance.GetWeb3(systemAccount));

            var paymentPerDay = 2.MAlgo() / 2 / 365;
            BigInteger expectedMinerBalance = 0;
            BigInteger expectedReferralBalance = 0;

            for (int i = 0; i < 5; i++)
            {
                await miner1.MineAsync();
                expectedMinerBalance += paymentPerDay;
                expectedReferralBalance += paymentPerDay * 10 / 100;

                Assert.Equal(expectedMinerBalance, await token.BalanceOfAsync(minerAccount.Address));
                Assert.Equal(expectedReferralBalance, await token.BalanceOfAsync(referralAccount.Address));
            }

            // Pause the miner...
            miner1.Bind(EthNetwork.Instance.GetWeb3(supervisorAccount));
            await miner1.PauseMiningAsync();

            // Try to mine one day...
            miner1.Bind(EthNetwork.Instance.GetWeb3(systemAccount));
            await Assert.ThrowsAsync<TransactionRejectedException>(
                () => miner1.MineAsync());

            // Ensure the balance is not changed...
            Assert.Equal(expectedMinerBalance, await token.BalanceOfAsync(minerAccount.Address));

            // Resume the miner...
            miner1.Bind(EthNetwork.Instance.GetWeb3(supervisorAccount));
            await miner1.ResumeMiningAsync();

            // Mine one day...
            miner1.Bind(EthNetwork.Instance.GetWeb3(coreTeamAccount));
            await miner1.MineAsync();
            expectedMinerBalance += paymentPerDay;
            expectedReferralBalance += paymentPerDay * 10 / 100;

            Assert.Equal(expectedMinerBalance, await token.BalanceOfAsync(minerAccount.Address));
            Assert.Equal(expectedReferralBalance, await token.BalanceOfAsync(referralAccount.Address));
        }

        [Fact]
        public async Task TerminateTest()
        {
            EthNetwork.UseDefaultTestNet();

            var prefundedAccount = new Account(EthNetwork.Instance.PrefundedPrivateKey);

            var tokenOwnerAccount = EthAccountFactory.Create();
            var coreTeamAccount = EthAccountFactory.Create();
            var minerAccount = EthAccountFactory.Create();
            var referralAccount = EthAccountFactory.Create();

            await EthNetwork.Instance.RefillAsync(tokenOwnerAccount);
            await EthNetwork.Instance.RefillAsync(coreTeamAccount);

            // Create the ERC20 token...
            var token = new AlgoTokenV1(EthNetwork.Instance.GetWeb3(tokenOwnerAccount), EthNetwork.Instance.GasPriceProvider);
            await token.DeployAsync();

            // Store the current balance of the token owner...
            var tokenOwnerAccountBalance = await token.BalanceOfAsync(tokenOwnerAccount.Address);

            // Create a miner...
            var miner1 = new AlgoMiner(EthNetwork.Instance.GetWeb3(coreTeamAccount), EthNetwork.Instance.GasPriceProvider);
            await miner1.DeployAsync(0, 2, minerAccount.Address, referralAccount.Address, token.ContractAddress);

            // Transfer some tokens to the miner...
            await token.TransferAsync(miner1.ContractAddress, 100.Algo());

            // Ensure the receiver got the tokens...
            Assert.Equal(100.Algo(), await token.BalanceOfAsync(miner1.ContractAddress));

            // Terminate the contract.
            await miner1.TerminateAsync();

            // Ensure the contract returned all the tokens...
            Assert.Equal(0, await token.BalanceOfAsync(miner1.ContractAddress));
            Assert.Equal(100.Algo(), await token.BalanceOfAsync(coreTeamAccount.Address));
        }
    }
}
