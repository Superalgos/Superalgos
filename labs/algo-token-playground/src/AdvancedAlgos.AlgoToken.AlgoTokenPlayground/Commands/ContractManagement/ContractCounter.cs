using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;

namespace AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Commands.ContractManagement
{
    public static class ContractCounter
    {
        private static long _count = 0;

        public static long Next()
        {
            Interlocked.Increment(ref _count);
            return _count;
        }
    }
}
