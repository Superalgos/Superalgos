using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Text;

namespace AdvancedAlgos.AlgoToken.Framework.Ethereum.Reflection
{
    public static class AssemblyExtensions
    {
        public static string GetResourceString(this Assembly assembly, string resourceName, Encoding encoding = null)
        {
            using (var stream = assembly.GetManifestResourceStream(assembly.GetName().Name + "." + resourceName))
            using (var reader = new StreamReader(stream, encoding ?? Encoding.UTF8))
            {
                return reader.ReadToEnd();
            }
        }
    }
}
