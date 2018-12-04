using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Runtime;

namespace AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Commands.AccountManagement
{
    public class ListAccountsCommand : ICommand
    {
        public Task ExecuteAsync(RuntimeContext context)
        {
            foreach (var ethAccountDescriptor in context.Accounts.Values)
            {
                Console.WriteLine($"- {ethAccountDescriptor.Name}:{ethAccountDescriptor.Account.Address}");
            }

            return Task.CompletedTask;
        }
    }
}
