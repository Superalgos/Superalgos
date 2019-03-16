import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
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
      type: new GraphQLList(EntryPointType),
      resolve(parent) {
        return parent.entryPoint;
      },
    },
    exitPoint: {
      type: new GraphQLList(ExitPointType),
      resolve(parent) {
        return parent.exitPoint;
      },
    },
    sellPoint: {
      type: new GraphQLList(SellPointType),
      resolve(parent) {
        return parent.sellPoint;
      },
    },
    buyPoint: {
      type: new GraphQLList(BuyPointType),
      resolve(parent) {
        return parent.buyPoint;
      },
    },
    stopLoss: {
      type: new GraphQLList(StopLossType),
      resolve(parent) {
        return parent.stopLoss;
      },
    },
    buyOrder: {
      type: new GraphQLList(BuyOrderType),
      resolve(parent) {
        return parent.buyOrder;
      },
    },
    sellOrder: {
      type: new GraphQLList(SellOrderType),
      resolve(parent) {
        return parent.sellOrder;
      },
    },
  }),
});

export default Type;
