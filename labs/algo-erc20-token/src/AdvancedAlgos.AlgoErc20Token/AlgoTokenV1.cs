using System;
using System.Numerics;
using System.Threading.Tasks;
using AdvancedAlgos.AlgoErc20Token.EthClientExtensions;
using Nethereum.Contracts;
using Nethereum.RPC.Eth.DTOs;

namespace AdvancedAlgos.AlgoErc20Token
{
    public class AlgoTokenV1 : Erc20Token<AlgoTokenV1>
    {
        protected override string AbiResourceName => $"SmartContracts.src.bin.{nameof(AlgoTokenV1)}.abi";
        protected override string BinResourceName => $"SmartContracts.src.bin.{nameof(AlgoTokenV1)}.bin";
        protected override BigInteger DeploymentGasUnits => 1200000;
    }
}
