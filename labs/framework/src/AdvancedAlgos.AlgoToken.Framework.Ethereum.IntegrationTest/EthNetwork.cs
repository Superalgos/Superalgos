using System;
using System.Collections.Generic;
using System.Numerics;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Nethereum.Hex.HexTypes;
using Nethereum.RPC.Accounts;
using Nethereum.Util;
using Nethereum.Web3;
using Nethereum.Web3.Accounts;

namespace AdvancedAlgos.AlgoToken.Framework.Ethereum.IntegrationTest
{
    public class EthNetwork
    {
        public const int TRANSACTION_BASE_FEE = 21000;

        public static EthNetwork Instance { get; private set; }

        private SemaphoreSlim _refillSync = new SemaphoreSlim(1, 1);

        public string Url { get; private set; }
        public string PrefundedAddress { get; private set; }
        public string PrefundedPrivateKey { get; private set; }
        public IGasPriceProvider GasPriceProvider { get; private set; }
        public BigInteger TxBaseFeeWei => GasPriceProvider.GetGasPrice() * TRANSACTION_BASE_FEE;

        public static void UseDefaultTestNet() => UseGanacheTestNet();

        public static void UseGanacheTestNet()
        {
            Instance = new EthNetwork
            {
                Url = "http://127.0.0.1:8545",
                PrefundedAddress = "0x06bB4674A4b08d07186b721378C7e241eD85443b",
                PrefundedPrivateKey = "0936af475d2701538aad321f87e0a51f2b297634653393e8cab7290a674009a5",
                GasPriceProvider = new StaticGasPriceProvider(2000000000)
            };
        }

        public static void UseGethTestNet()
        {
            Instance = new EthNetwork
            {
                Url = "http://10.4.0.4:8545",
                PrefundedAddress = "0x88474Ec3cfddfC943d3E42C94763D43f181A5a83",
                PrefundedPrivateKey = "0x69970bd6c1b6cfbffea16656c27ff7b330b751ed5e46c1644b54a642871f4bbb",
                GasPriceProvider = new StaticGasPriceProvider(2000000000)
            };
        }

        public Web3 GetWeb3() => new Web3(Url);
        public Web3 GetWeb3(IAccount account) => new Web3(account, Url);

        public Task RefillAsync(IAccount account)
        {
            return RefillAsync(account, UnitConversion.Convert.ToWei(1));
        }

        public async Task RefillAsync(IAccount account, BigInteger weis)
        {
            await _refillSync.WaitAsync();
            try
            {
                var prefundedAccount = new Account(PrefundedPrivateKey);
                var web3 = new Web3(prefundedAccount, Url);
                var recepit = await web3.TransactionManager.TransactionReceiptService.SendRequestAndWaitForReceiptAsync(() =>
                    web3.TransactionManager.SendTransactionAsync(prefundedAccount.Address, account.Address, new HexBigInteger(weis))
                );
            }
            finally
            {
                _refillSync.Release();
            }
        }
    }
}
