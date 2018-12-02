using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Runtime;

namespace AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Commands.EthNetwork
{
    public class SetNetworkCommand : ICommand
    {
        public string NetworkUrl { get; set; }

        public Task ExecuteAsync(RuntimeContext context)
        {
            if (string.Equals(NetworkUrl, RuntimeContext.LOCAL_NETWORK_ID, StringComparison.OrdinalIgnoreCase))
            {
                NetworkUrl = RuntimeContext.LOCAL_NETWORK_URL;
            }

            context.EthNetworkUrl = NetworkUrl;

            Console.WriteLine($"Network set to '{NetworkUrl}'.");

            return Task.CompletedTask;
        }
    }
}
