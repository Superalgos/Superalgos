using System;
using System.Collections.Generic;
using System.Globalization;
using System.Numerics;
using System.Text;
using Sprache;

namespace AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Parsers
{
    public static class CommonParsers
    {
        public static readonly Parser<char> ReservedChar =
            Parse.Char(' ').XOr(Parse.Char(':')).XOr(Parse.Char('/')).XOr(Parse.Char('-')).XOr(Parse.Char('.')).XOr(Parse.Char(','));

        public static readonly Parser<string> Integer =
            Parse.Digit.AtLeastOnce().Text().Token();

        public static readonly Parser<IEnumerable<char>> String =
            Parse.AnyChar.Except(ReservedChar).AtLeastOnce().Text();

        public static readonly Parser<IEnumerable<char>> QuotedString =
            from open in Parse.Char('"')
            from content in Parse.CharExcept('"').Many().Text()
            from close in Parse.Char('"')
            select content;

        public static readonly Parser<byte> ByteValue =
            Integer.Select(x => byte.Parse(x, CultureInfo.InvariantCulture));

        public static readonly Parser<int> IntegerValue =
            Integer.Select(x => int.Parse(x, CultureInfo.InvariantCulture));

        public static readonly Parser<BigInteger> BigIntegerValue =
            Integer.Select(x => BigInteger.Parse(x, CultureInfo.InvariantCulture));

        public static readonly Parser<decimal> DecimalValue =
            Parse.DecimalInvariant.Token().Select(x => decimal.Parse(x, CultureInfo.InvariantCulture));

        public static readonly Parser<string> StringValue =
            QuotedString.XOr(String).Text().Token();

        public static readonly Parser<string> Identifier =
            Parse.AnyChar.Except(ReservedChar).AtLeastOnce().Text().Token();

        public static Parser<bool> Token(string name)
            => Parse.IgnoreCase(name).Text().Token().Select(_ => true);

        public static Parser<bool> Switch(char shortName, string longName)
            => (from switchIdentifier in ShortSwitch(shortName).Or(LongSwitch(longName))
                select true).Token();

        public static Parser<T> Switch<T>(char shortName, string longName, Parser<T> valueParser)
            => (from switchIdentifier in ShortSwitch(shortName).Or(LongSwitch(longName))
                from separator in Parse.Char(' ').XOr(Parse.Char(':')).Optional()
                from value in valueParser
                select value).Token();

        public static Parser<IEnumerable<T>> List<T>(Parser<T> itemParser)
            => itemParser.DelimitedBy(Parse.Char(',')).Token();

        public static Parser<T> EnumValue<T>() where T : struct
            => StringValue.Select(x => Enum.Parse<T>(x, true));

        public static Parser<bool> ShortSwitch(char shortName)
            => from prefix in Parse.Char('/').XOr(Parse.Char('-'))
               from switchIdentifier in Parse.IgnoreCase(shortName)
               select true;

        public static Parser<bool> LongSwitch(string longName)
            => from prefix in Parse.String("--")
               from switchIdentifier in Parse.IgnoreCase(longName)
               select true;

        public static Parser<string> Invoke(string functionName)
            => from target in Identifier
               from separator in Parse.Char('.')
               from _ in Token(functionName)
               select target;
    }
}
