using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Runtime;
using AdvancedAlgos.AlgoToken.Framework.Ethereum;

namespace AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Commands.ContractManagement
{
    public class RegisterContractCommand : ICommand
    {
        public string Name { get; set; }
        public string Address { get; set; }

        public Task ExecuteAsync(RuntimeContext context)
        {
            if (context.Contracts.ContainsKey(Name)) throw new Exception($"The name '{Name}' already exists.");
            if (!EthAddressParser.ValidateAddress(Address)) throw new Exception($"The address '{Address}' is invalid.");

            context.Contracts.Add(Name, new EthContractDescriptor(Name, Address));

            Console.WriteLine($"Contract at '{Address}' registered as '{Name}'.");

            return Task.CompletedTask;
        }
    }
}
