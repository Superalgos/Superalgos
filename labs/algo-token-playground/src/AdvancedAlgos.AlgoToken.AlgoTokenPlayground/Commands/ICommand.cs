using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Runtime;

namespace AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Commands
{
    public interface ICommand
    {
        Task ExecuteAsync(RuntimeContext context);
    }
}
