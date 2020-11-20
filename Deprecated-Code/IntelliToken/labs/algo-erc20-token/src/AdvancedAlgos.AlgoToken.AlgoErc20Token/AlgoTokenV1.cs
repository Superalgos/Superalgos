using System;
using System.Numerics;
using System.Threading.Tasks;
using AdvancedAlgos.AlgoToken.Framework.Ethereum;
using Nethereum.Contracts;
using Nethereum.RPC.Eth.DTOs;
using Nethereum.Web3;

namespace AdvancedAlgos.AlgoToken.AlgoErc20Token
{
    public class AlgoTokenV1 : Erc20Token<AlgoTokenV1>
    {
        public AlgoTokenV1(Web3 web3, IGasPriceProvider gasPriceProvider) : base(web3, gasPriceProvider) { }
        public AlgoTokenV1(string contractAddress, Web3 web3, IGasPriceProvider gasPriceProvider) : base(contractAddress, web3, gasPriceProvider) { }

        protected override string AbiResourceName => $"SmartContracts.src.bin.{nameof(AlgoTokenV1)}.abi";
        protected override string BinResourceName => $"SmartContracts.src.bin.{nameof(AlgoTokenV1)}.bin";
        protected override BigInteger DeploymentGasUnits => 1200000;
    }
}
