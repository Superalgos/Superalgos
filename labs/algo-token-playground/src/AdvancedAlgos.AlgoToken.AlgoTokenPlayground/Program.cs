using System;
using System.Threading.Tasks;

namespace AdvancedAlgos.AlgoToken.AlgoTokenPlayground
{
    public static class Program
    {
        public static async Task Main(string[] args)
        {
            await REPL.Instance.RunAsync();
        }
    }
}
