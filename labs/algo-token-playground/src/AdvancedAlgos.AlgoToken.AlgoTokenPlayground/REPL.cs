using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Commands;
using AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Parsers;
using AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Runtime;
using Sprache;

namespace AdvancedAlgos.AlgoToken.AlgoTokenPlayground
{
    public class REPL
    {
        public static readonly REPL Instance = new REPL();

        private readonly List<Parser<ICommand>> _parsers = new List<Parser<ICommand>>();
        private readonly RuntimeContext _context = new RuntimeContext();

        static REPL()
        {
            SystemParsers.Register();
            EthNetworkParsers.Register();
            EthTransactionsParsers.Register();
            AccountManagementParsers.Register();
            ContractManagementParsers.Register();
            AlgoTokenParsers.Register();
            AlgoPoolParsers.Register();
            AlgoFeesParsers.Register();
            AlgoMinerParsers.Register();
        }

        private REPL() { }

        public void RegisterParser(Parser<ICommand> parser) => _parsers.Add(parser);

        public async Task RunAsync()
        {
            Console.WriteLine("Ready.");

            do
            {
                PrintPrompt();
            } while (await ProcessAsync(Console.ReadLine()));
        }

        private void PrintPrompt()
        {
            var prompt = new StringBuilder();

            if (_context.CurrentAccount != null)
            {
                prompt.Append(_context.CurrentAccount.Name);
            }

            prompt.Append(">");

            Console.Write(prompt.ToString());
        }

        private async Task<bool> ProcessAsync(string commandLine)
        {
            if (string.IsNullOrWhiteSpace(commandLine)) return true;

            if (commandLine.Equals("cls", StringComparison.OrdinalIgnoreCase) ||
                commandLine.Equals("clear", StringComparison.OrdinalIgnoreCase))
            {
                Console.Clear();
                return true;
            }

            if (commandLine.Equals("exit", StringComparison.OrdinalIgnoreCase) ||
                commandLine.Equals("quit", StringComparison.OrdinalIgnoreCase)) return false;

            foreach (var parser in _parsers)
            {
                var result = parser.TryParse(commandLine);

                if (!result.WasSuccessful) continue;

                try
                {
                    await result.Value.ExecuteAsync(_context);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                }

                return true;
            }

            Console.WriteLine("Syntax error.");

            return true;
        }
    }
}
