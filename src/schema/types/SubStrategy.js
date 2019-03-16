import {
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import {
  EntryPointType,
  ExitPointType,
  SellPointType,
  BuyPointType,
  StopLossType,
  BuyOrderType,
  SellOrderType,
} from './index';

const Type = new GraphQLObjectType({
  name: 'SubStrategy',
  description: 'SubStrategy composing a strategy',
  fields: () => ({
    name: { type: GraphQLString },
    entryPoint: {
      type: EntryPointType,
      resolve(parent) {
        return parent.entryPoint;
      },
    },
    exitPoint: {
      type: ExitPointType,
      resolve(parent) {
        return parent.exitPoint;
      },
    },
    sellPoint: {
      type: SellPointType,
      resolve(parent) {
        return parent.sellPoint;
      },
    },
    buyPoint: {
      type: BuyPointType,
      resolve(parent) {
        return parent.buyPoint;
      },
    },
    stopLoss: {
      type: StopLossType,
      resolve(parent) {
        return parent.stopLoss;
      },
    },
    buyOrder: {
      type: BuyOrderType,
      resolve(parent) {
        return parent.buyOrder;
      },
    },
    sellOrder: {
      type: SellOrderType,
      resolve(parent) {
        return parent.sellOrder;
      },
    },
  }),
});

export default Type;
