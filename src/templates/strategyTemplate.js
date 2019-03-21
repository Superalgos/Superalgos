/* eslint-disable max-len */
const strategy = {
  subStrategies: [
    {
      name: 'Trend Following',
      entryPoint: {
        situations: [
          {
            name: 'Price Collapsing',
            conditions: [
              {
                name: '%B Moving Average going up',
                code: "percentageBandwidth.previous.direction === 'down' && percentageBandwidth.direction === 'down'",
              },
              {
                name: '%B Bandwidth going up',
                code: 'percentageBandwidth.previous.previous.bandwidth < percentageBandwidth.previous.bandwidth && percentageBandwidth.previous.bandwidth < percentageBandwidth.bandwidth',
              },
              {
                name: 'Candles Min going down',
                code: 'candle.previous.previous.min > candle.previous.min && candle.previous.min > candle.min',
              },
            ],
          },
        ],
      },
      exitPoint: {
        situations: [
          {
            name: 'Market Reversing',
            conditions: [
              {
                name: 'Close above Band Moving Average',
                code: 'candle.close > bollingerBand.movingAverage',
              },
            ],
          },
        ],
      },
      sellPoint: {
        situations: [
          {
            name: 'Min below lower bollingerBand.',
            conditions: [
              {
                name: '3 Candles MIN below Lower Band',
                code: 'candle.previous.previous.min < bollingerBand.previous.previous.movingAverage - bollingerBand.previous.previous.deviation && candle.previous.min < bollingerBand.previous.movingAverage - bollingerBand.previous.deviation && candle.min < bollingerBand.movingAverage - bollingerBand.deviation',
              },
            ],
          },
        ],
      },
      stopLoss: {
        phases: [
          {
            name: 'Following Sell Rate',
            code: 'newStopLoss = sellRate + sellRate * (stopLossPercentage - stopLossDecay) / 100',
            situations: [
              {
                name: 'Candle below Moving Average',
                conditions: [
                  {
                    name: 'Candle fully below Band Moving Average',
                    code: 'candle.max < bollingerBand.movingAverage',
                  },
                  {
                    name: 'Band Moving Average going down',
                    code: "bollingerBand.direction === 'down'",
                  },
                ],
              },
            ],
          },
          {
            name: 'Above Bands Moving Average',
            code: 'newStopLoss = bollingerBand.movingAverage + bollingerBand.movingAverage * (stopLossPercentage - stopLossDecay) / 100',
            situations: [
              {
                name: 'Candle below Moving Average',
                conditions: [
                  {
                    name: 'Candle MAX below lower band',
                    code: 'candle.max < bollingerBand.movingAverage - bollingerBand.deviation',
                  },
                ],
              },
            ],
          },
          {
            name: 'At Bands Moving Average',
            code: 'newStopLoss = bollingerBand.movingAverage',
            situations: [],
          },
        ],
      },
      buyOrder: {
        phases: [
          {
            name: '12 times standard deviation',
            code: 'buyOrder = bollingerBand.movingAverage - bollingerBand.standardDeviation * 12',
            situations: [
              {
                name: 'Candle cut by lower band',
                conditions: [
                  {
                    name: 'Max above lower band',
                    code: 'candle.max > bollingerBand.movingAverage - bollingerBand.deviation',
                  },
                  {
                    name: 'MIN below lower band',
                    code: 'candle.min < bollingerBand.movingAverage - bollingerBand.deviation',
                  },
                  {
                    name: 'Band Moving Average going down',
                    code: 'bollingerBand.previous.movingAverage > bollingerBand.movingAverage',
                  },
                ],
              },
            ],
          },
          {
            name: '10 times standard deviation',
            code: 'buyOrder = bollingerBand.movingAverage - bollingerBand.standardDeviation * 10',
            situations: [
              {
                name: '%B starting to revert',
                conditions: [
                  {
                    name: '%B Moving Average going up',
                    code: "percentageBandwidth.direction === 'up'",
                  },
                  {
                    name: '%B Moving Average above 0',
                    code: 'percentageBandwidth.movingAverage > 0',
                  },
                ],
              },
            ],
          },
          {
            name: '4 times standard deviation',
            code: 'buyOrder = bollingerBand.movingAverage - bollingerBand.standardDeviation * 4',
            situations: [
              {
                name: '%B going down again',
                conditions: [
                  {
                    name: '%B Moving Average going down',
                    code: "percentageBandwidth.direction === 'down'",
                  },
                ],
              },
            ],
          },
          {
            name: '3 times standard deviation',
            code: 'buyOrder = bollingerBand.movingAverage - bollingerBand.standardDeviation * 3',
            situations: [
              {
                name: '%B going up and above 30',
                conditions: [
                  {
                    name: '%B Moving Average going up',
                    code: "percentageBandwidth.direction === 'up'",
                  },
                  {
                    name: '%B Moving Average above 30',
                    code: 'percentageBandwidth.movingAverage > 30',
                  },
                ],
              },
            ],
          },
          {
            name: 'At lower band',
            code: 'buyOrder = bollingerBand.movingAverage - bollingerBand.standardDeviation * 2',
            situations: [],
          },
        ],
      },
    },
    {
      name: 'Range Trading',
      entryPoint: {
        situations: [
          {
            name: 'Gentle Up Trend',
            conditions: [
              {
                name: 'Sub-Channel going up',
                code: "subChannel.direction === 'up'",
              },
              {
                name: 'Sub-Channel Side|Gentle|Medium',
                code: "subChannel.slope === 'Side' || subChannel.slope === 'Gentle' || subChannel.slope === 'Medium'",
              },
              {
                name: 'Candle Close above Lower Band',
                code: 'candle.close > bollingerBand.movingAverage + bollingerBand.deviation',
              },
              { name: 'Impossible', code: ' 1 === 2' },
            ],
          },
        ],
      },
      exitPoint: {
        situations: [
          {
            name: 'Outside Sub-Channel',
            conditions: [
              {
                name: 'Going down or too Steep',
                code: "subChannel.direction === 'Down' || subChannel.slope === 'Steep' || subChannel.slope === 'Extreme'",
              },
            ],
          },
        ],
      },
      sellPoint: {
        situations: [
          {
            name: 'Min below lower bollingerBand.',
            conditions: [
              {
                name: '%B Moving Average going down',
                code: 'percentageBandwidth.previous.movingAverage > percentageBandwidth.movingAverage',
              },
              {
                name: '%B Moving Average above 90',
                code: 'percentageBandwidth.previous.movingAverage > 90',
              },
            ],
          },
        ],
      },
      stopLoss: {
        phases: [
          {
            name: 'Following Sell Rate',
            code: 'newStopLoss = sellRate + sellRate * (stopLossPercentage - stopLossDecay) / 100',
            situations: [],
          },
        ],
      },
      buyOrder: {
        phases: [
          {
            name: 'Between Band Moving Average and Lower Band',
            code: 'buyOrder = bollingerBand.movingAverage - bollingerBand.standardDeviation',
            situations: [],
          },
        ],
      },
    },
    {
      name: 'LRC Strategy',
      entryPoint: {
        situations: [
          {
            name: 'Lines in the right order',
            conditions: [
              { name: '60 > 30', code: 'LRC._60 > LRC._30' },
              { name: '30 > 15', code: 'LRC._30 > LRC._15' },
              { name: 'Impossible', code: ' 1 === 2' },
            ],
          },
        ],
      },
      exitPoint: {
        situations: [
          {
            name: 'Lines out of order',
            conditions: [
              {
                name: '60 < 30 or 30 < 15',
                code: 'LRC._60 < LRC._30 || LRC._30 < LRC._15 ',
              },
            ],
          },
        ],
      },
      sellPoint: {
        situations: [
          {
            name: 'All lines going down',
            conditions: [
              { name: '60 going down', code: "LRC.direction60 === 'down'" },
              { name: '30 going down', code: "LRC.direction30 === 'down'" },
              { name: '15 going down', code: "LRC.direction15 === 'down'" },
            ],
          },
        ],
      },
      stopLoss: {
        phases: [
          {
            name: 'Following Sell Rate',
            code: 'newStopLoss = sellRate + sellRate * (stopLossPercentage - stopLossDecay) / 100',
            situations: [
              {
                name: 'Stop Loss < 60',
                conditions: [
                  { name: 'Stop Loss < 60', code: 'stopLoss < LRC._60' },
                ],
              },
            ],
          },
          {
            name: 'Following 60',
            code: 'newStopLoss = LRC._60',
            situations: [],
          },
        ],
      },
      buyOrder: {
        phases: [
          {
            name: 'Between Band Moving Average and Lower Band',
            code: 'buyOrder = bollingerBand.movingAverage - bollingerBand.standardDeviation * 4',
            situations: [],
          },
        ],
      },
    },
  ],
};

export default strategy;
