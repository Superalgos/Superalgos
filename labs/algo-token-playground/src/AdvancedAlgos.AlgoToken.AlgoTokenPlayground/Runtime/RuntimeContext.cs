using System;
using System.Collections.Generic;
using System.Text;
using AdvancedAlgos.AlgoToken.Framework.Ethereum;

namespace AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Runtime
{
    public class RuntimeContext
    {
        public const string LOCAL_NETWORK_ID = "local";
        public const string LOCAL_NETWORK_URL = "http://127.0.0.1:8545";

        public string EthNetworkUrl { get; set; } = LOCAL_NETWORK_URL;
        public EthAccountDescriptor CurrentAccount { get; set; }
        public Dictionary<string, EthAccountDescriptor> Accounts { get; private set; } = new Dictionary<string, EthAccountDescriptor>(StringComparer.OrdinalIgnoreCase);
        public Dictionary<string, EthContractDescriptor> Contracts { get; private set; } = new Dictionary<string, EthContractDescriptor>(StringComparer.OrdinalIgnoreCase);
        public StaticGasPriceProvider GasPriceProvider { get; } = new StaticGasPriceProvider();

        public void Reset()
        {
            Accounts = new Dictionary<string, EthAccountDescriptor>(StringComparer.OrdinalIgnoreCase);
            Contracts = new Dictionary<string, EthContractDescriptor>(StringComparer.OrdinalIgnoreCase);
        }

        public string ResolveAccountReference(string reference)
        {
            if (string.IsNullOrWhiteSpace(reference) || string.Equals(reference, "0x0", StringComparison.OrdinalIgnoreCase)) return "0x0";

            if (TryResolveAccountReference(reference, out string address)) return address;

            throw new Exception($"Invalid account name or address: '{reference}'.");
        }

        public string ResolveContractReference(string reference)
        {
            if (TryResolveContractReference(reference, out string address)) return address;

            throw new Exception($"Invalid contract name or address: '{reference}'.");
        }

        public string ResolveAccountOrContractReference(string reference)
        {
            if (TryResolveAccountOrContractReference(reference, out string address)) return address;

            throw new Exception($"Invalid name or address: '{reference}'.");
        }

        public bool TryResolveAccountReference(string reference, out string address)
        {
            if (Accounts.ContainsKey(reference))
            {
                address = Accounts[reference].Account.Address;
                return true;
            }

            if (EthAddressParser.ValidateAddress(reference))
            {
                address = reference;
                return true;
            }

            address = null;
            return false;
        }

        public bool TryResolveContractReference(string reference, out string address)
        {
            if (Contracts.ContainsKey(reference))
            {
                address = Contracts[reference].ContractAddress;
                return true;
            }

            if (EthAddressParser.ValidateAddress(reference))
            {
                address = reference;
                return true;
            }

            address = null;
            return false;
        }

        public bool TryResolveAccountOrContractReference(string reference, out string address)
        {
            if (TryResolveAccountReference(reference, out address)) return true;
            if (TryResolveContractReference(reference, out address)) return true;
            return false;
        }
    }
}
