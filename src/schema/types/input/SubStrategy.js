import {
  GraphQLString,
  GraphQLInputObjectType,
} from 'graphql';
import {
  EntryPointInputType,
  ExitPointInputType,
  SellPointInputType,
  BuyPointInputType,
  StopLossInputType,
  BuyOrderInputType,
  SellOrderInputType,
} from './TheSevenMonolitics';

const Type = new GraphQLInputObjectType({
  name: 'SubStrategyInput',
  description: 'Payload for subStrategy input',
  fields: () => ({
    name: { type: GraphQLString },
    entryPoint: { type: EntryPointInputType },
    exitPoint: { type: ExitPointInputType },
    sellPoint: { type: SellPointInputType },
    buyPoint: { type: BuyPointInputType },
    stopLoss: { type: StopLossInputType },
    buyOrder: { type: BuyOrderInputType },
    sellOrder: { type: SellOrderInputType },
  }),
});

export default Type;
