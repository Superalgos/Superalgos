import React from 'react';

import {
  XYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  VerticalGridLines,
  LineSeries
} from 'index';

const data = [];

for (let i = 0; i < 20; i++) {
  const series = [];
  for (let j = 0; j < 100; j++) {
    series.push({x: j, y: (i / 10 + 1) * Math.sin(Math.PI * (i + j) / 50)});
  }
  data.push({color: i, key: i, data: series, opacity: 0.8});
}

export default class Example extends React.Component {
  render() {
    return (
      <XYPlot
        width={300}
        height={300}
        colorType="linear"
        colorDomain={[0, 9]}
        colorRange={['yellow', 'orange']}
        >
        <HorizontalGridLines />
        <VerticalGridLines />
        <XAxis />
        <YAxis />
        {data.map(props => <LineSeries {...props}/>)}
      </XYPlot>
    );
  }
}
