using System;
using System.Collections.Generic;
using System.Text;
using AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Commands.System;
using Sprache;

namespace AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Parsers
{
    public static class SystemParsers
    {
        public static void Register()
        {
            (from command in CommonParsers.Token("reset")
             select new ResetCommand()
             ).Register();

            (from command in CommonParsers.Token("list-env")
             select new ListEnvironmentCommand()
             ).Register();
        }
    }
}
