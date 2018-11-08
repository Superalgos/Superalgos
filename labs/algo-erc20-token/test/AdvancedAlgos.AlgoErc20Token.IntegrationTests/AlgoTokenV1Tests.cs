using System;
using System.Numerics;
using System.Threading.Tasks;
using AdvancedAlgos.AlgoErc20Token.EthClientExtensions;
using AdvancedAlgos.AlgoErc20Token.EthClientExtensions.Exceptions;
using Nethereum.Web3;
using Nethereum.Web3.Accounts;
using Xunit;

namespace AdvancedAlgos.AlgoErc20Token.IntegrationTests
{
    public class AlgoTokenV1Tests
    {
        private const long INITIAL_SUPPLY = 1000000000;
        private const byte TOKEN_DECIMALS = 18;

        private static BigInteger _tokenFactor = BigInteger.Pow(10, TOKEN_DECIMALS);

        [Fact]
        public async Task DeployContractAndTransferTokensTest()
        {
            EthNetwork.UseGethTestNet();

            var account1 = new Account(EthNetwork.Instance.PrefundedPrivateKey);
            var account2 = EthAccountFactory.Create();

            var web3 = new Web3(account1, EthNetwork.Instance.Url);

            var contract = new AlgoTokenV1();

            await contract.DeployAsync(web3, EthNetwork.Instance.GasPrice);

            Assert.Equal(INITIAL_SUPPLY.Algo(), await contract.BalanceOfAsync(account1.Address));

            await contract.TransferAsync(EthNetwork.Instance.GasPrice, account2.Address, 2.Algo());

            Assert.Equal(2.Algo(), await contract.BalanceOfAsync(account2.Address));
        }

        [Fact]
        public async Task PausableFeatureTest()
        {
            EthNetwork.UseGethTestNet();

            var account1 = new Account(EthNetwork.Instance.PrefundedPrivateKey);
            var account2 = EthAccountFactory.Create();

            var web3 = new Web3(account1, EthNetwork.Instance.Url);

            var contract = new AlgoTokenV1();

            await contract.DeployAsync(web3, EthNetwork.Instance.GasPrice);

            await contract.TransferAsync(EthNetwork.Instance.GasPrice, account2.Address, 2.Algo());

            Assert.Equal(2.Algo(), await contract.BalanceOfAsync(account2.Address));

            await contract.PauseAsync(EthNetwork.Instance.GasPrice);

            await Assert.ThrowsAsync<TransactionRejectedException>(
                () => contract.TransferAsync(EthNetwork.Instance.GasPrice, account2.Address, 2.Algo()));

            Assert.Equal(2.Algo(), await contract.BalanceOfAsync(account2.Address));

            await contract.UnpauseAsync(EthNetwork.Instance.GasPrice);

            Assert.Equal(2.Algo(), await contract.BalanceOfAsync(account2.Address));

            await contract.TransferAsync(EthNetwork.Instance.GasPrice, account2.Address, 2.Algo());

            Assert.Equal(4.Algo(), await contract.BalanceOfAsync(account2.Address));
        }
    }
}
