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
} from './index';

const Type = new GraphQLInputObjectType({
  name: 'SubStrategyInput',
  description: 'Payload for subStrategy input',
  fields: () => ({
    name: GraphQLString,
    entryPoint: EntryPointInputType,
    exitPoint: ExitPointInputType,
    sellPoint: SellPointInputType,
    buyPoint: BuyPointInputType,
    stopLoss: StopLossInputType,
    buyOrder: BuyOrderInputType,
    sellOrder: SellOrderInputType,
  }),
});

export default Type;
