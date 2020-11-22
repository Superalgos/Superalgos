import {
  GraphQLEnumType,
} from 'graphql';

import { HistoryTypeEnum } from '../../../enums/HistoryType';

const values = {};
HistoryTypeEnum.forEach((HistoryType) => {
  values[HistoryType] = { value: HistoryType };
});

const HistoryTypeEnumType = new GraphQLEnumType({
  name: 'HistoryTypeEnum',
  values,
});

export {
  HistoryTypeEnumType as default,
};
