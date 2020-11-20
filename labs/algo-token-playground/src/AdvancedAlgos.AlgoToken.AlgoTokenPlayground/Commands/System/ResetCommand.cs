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
    public class ResetCommand : ICommand
    {
        public Task ExecuteAsync(RuntimeContext context)
        {
            context.Reset();

            Console.WriteLine("Done.");

            return Task.CompletedTask;
        }
    }
}
