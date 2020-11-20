using System;
using System.Collections.Generic;
using System.Text;
using AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Commands;
using Sprache;

namespace AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Parsers
{
    public static class ParserExtensions
    {
        public static void Register(this Parser<ICommand> parser)
            => REPL.Instance.RegisterParser(parser);
    }
}
