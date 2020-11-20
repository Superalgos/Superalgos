using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Runtime;

namespace AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Commands.AccountManagement
{
    public class SetAccountCommand : ICommand
    {
        public string Name { get; set; }

        public Task ExecuteAsync(RuntimeContext context)
        {
            if (!context.Accounts.ContainsKey(Name)) throw new Exception($"Account '{Name}' not found.");

            context.CurrentAccount = context.Accounts[Name];

            return Task.CompletedTask;
        }
    }
}
