using System;
using System.Collections.Generic;
using System.Numerics;
using System.Text;
using System.Threading.Tasks;
using AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Runtime;
using AdvancedAlgos.AlgoToken.Framework.Ethereum;
using Nethereum.Util;

namespace AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Commands.System
{
    public class ListEnvironmentCommand : ICommand
    {
        public Task ExecuteAsync(RuntimeContext context)
        {
            Console.WriteLine($"- Network Url: '{context.EthNetworkUrl}'.");
            Console.WriteLine($"- Gas Price: {UnitConversion.Convert.FromWei(context.GasPriceProvider.GetGasPrice(), UnitConversion.EthUnit.Gwei)}Gwei.");

            return Task.CompletedTask;
        }
    }
}
