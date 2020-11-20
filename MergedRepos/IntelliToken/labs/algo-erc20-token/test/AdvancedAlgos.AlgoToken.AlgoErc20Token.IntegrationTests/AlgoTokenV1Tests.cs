using System;
using System.Numerics;
using System.Threading.Tasks;
using AdvancedAlgos.AlgoToken.Framework.Ethereum;
using AdvancedAlgos.AlgoToken.Framework.Ethereum.Exceptions;
using AdvancedAlgos.AlgoToken.Framework.Ethereum.IntegrationTest;
using Nethereum.Web3;
using Nethereum.Web3.Accounts;
using Xunit;

namespace AdvancedAlgos.AlgoToken.AlgoErc20Token.IntegrationTests
{
    public class AlgoTokenV1Tests
    {
        private const long INITIAL_SUPPLY = 1000000000;

        [Fact]
        public async Task DeployContractAndTransferTokensTest()
        {
            EthNetwork.UseDefaultTestNet();

            var account1 = new Account(EthNetwork.Instance.PrefundedPrivateKey);
            var account2 = EthAccountFactory.Create();

            // Create the ERC20 token...
            var contract = new AlgoTokenV1(EthNetwork.Instance.GetWeb3(account1), EthNetwork.Instance.GasPriceProvider);
            await contract.DeployAsync();

            // Ensure that the initial supply is allocated to the owner...
            Assert.Equal(INITIAL_SUPPLY.Algo(), await contract.BalanceOfAsync(account1.Address));

            // Perform a transfer...
            await contract.TransferAsync(account2.Address, 2.Algo());

            // Ensure the receiver got the tokens...
            Assert.Equal(2.Algo(), await contract.BalanceOfAsync(account2.Address));
        }

        [Fact]
        public async Task PausableFeatureTest()
        {
            EthNetwork.UseDefaultTestNet();

            var account1 = new Account(EthNetwork.Instance.PrefundedPrivateKey);
            var account2 = EthAccountFactory.Create();

            // Create the ERC20 token...
            var contract = new AlgoTokenV1(EthNetwork.Instance.GetWeb3(account1), EthNetwork.Instance.GasPriceProvider);
            await contract.DeployAsync();

            // Perform a transfer and check the result...
            await contract.TransferAsync(account2.Address, 2.Algo());
            Assert.Equal(2.Algo(), await contract.BalanceOfAsync(account2.Address));

            // Pause the contract...
            await contract.PauseAsync();

            // Ensure the contract cannot be used while is in paused state...
            await Assert.ThrowsAsync<TransactionRejectedException>(
                () => contract.TransferAsync(account2.Address, 2.Algo()));

            // Ensure the balance was not modified...
            Assert.Equal(2.Algo(), await contract.BalanceOfAsync(account2.Address));

            // Unpause the contract...
            await contract.UnpauseAsync();

            // Try a new transfer and ensure it succeeded...
            await contract.TransferAsync(account2.Address, 2.Algo());
            Assert.Equal(4.Algo(), await contract.BalanceOfAsync(account2.Address));
        }
    }
}
