var test = require('tape');
var Parser = require('../');

test('type number', function (t) {
  t.plan(2);

  var p = new Parser();
  var expected = [ 1, {number: 1} ];
  expected.push(expected.slice());
  
  p.onValue = function (value) {
    t.deepEqual(value, expected.shift());
  };

  p.write('{ "number": 1 }');
});

test('type double', function (t) {
  t.plan(3);

  var p = new Parser();
  var expected = [ 'Edm.Double', '1.0', {doubleNumber: '1.0', 'doubleNumber@odata.type': 'Edm.Double'} ];
  expected.push(expected.slice());
  
  p.onValue = function (value) {
    t.deepEqual(value, expected.shift());
  };

  p.write('{ "doubleNumber": 1.0 }');
});

test('type large double', function (t) {
  t.plan(3);

  var p = new Parser();
  var expected = [ 'Edm.Double', '1234567898765432123456.0123456789876543210', {doubleNumber: '1234567898765432123456.0123456789876543210', 'doubleNumber@odata.type': 'Edm.Double'} ];
  expected.push(expected.slice());
  
  p.onValue = function (value) {
    t.deepEqual(value, expected.shift());
  };

  p.write('{ "doubleNumber": 1234567898765432123456.0123456789876543210 }');
});

test('full odata entity', function (t) {
  t.plan(17);

  var p = new Parser();
  var expected = [ 'http://test.table.core.windows.net/$metadata#tty/@Element',
    'test.tty', 
    'http://test.table.core.windows.net/tty(PartitionKey=\'AAA\',RowKey=\'0001\')',
    'W/\"datetime\'2016-01-07T02%3A59%3A28.6909359Z\'\"',
    'tty(PartitionKey=\'AAA\',RowKey=\'0001\')',
    'AAA',
    '0001',
    'Edm.DateTime',
    '2016-01-07T02:59:28.6909359Z',
    'Edm.Double',
    '1.0',
    'Edm.Double',
    '1234567898765432123456.0123456789876543210',
    2,
    'Edm.Int64',
    '1234567890123456789',
    { DoubleValue: '1.0',
      'DoubleValue@odata.type': 'Edm.Double', 
      DoubleLargeValue: '1234567898765432123456.0123456789876543210', 
      'DoubleLargeValue@odata.type': 'Edm.Double',
      Int32Value: 2,
      'Int64Value@odata.type': 'Edm.Int64',
      Int64Value: "1234567890123456789",
      PartitionKey: 'AAA', 
      RowKey: '0001', 
      Timestamp: '2016-01-07T02:59:28.6909359Z', 
      'Timestamp@odata.type': 'Edm.DateTime', 
      'odata.editLink': 'tty(PartitionKey=\'AAA\',RowKey=\'0001\')', 
      'odata.etag': 'W/\"datetime\'2016-01-07T02%3A59%3A28.6909359Z\'\"', 
      'odata.id': 'http://test.table.core.windows.net/tty(PartitionKey=\'AAA\',RowKey=\'0001\')', 
      'odata.metadata': 'http://test.table.core.windows.net/$metadata#tty/@Element', 
      'odata.type': 'test.tty' 
    }
  ];
  expected.push(expected.slice());

  p.onValue = function (value) {
    t.deepEqual(value, expected.shift());
  };

  p.write('{');
  p.write('"odata.metadata":"http://test.table.core.windows.net/$metadata#tty/@Element",');
  p.write('"odata.type":"test.tty",');
  p.write('"odata.id":"http://test.table.core.windows.net/tty(PartitionKey=\'AAA\',RowKey=\'0001\')",');
  p.write('"odata.etag":"W/\\\"datetime\'2016-01-07T02%3A59%3A28.6909359Z\'\\\"",');
  p.write('"odata.editLink":"tty(PartitionKey=\'AAA\',RowKey=\'0001\')",');
  p.write('"PartitionKey":"AAA",');
  p.write('"RowKey":"0001",');
  p.write('"Timestamp@odata.type":"Edm.DateTime",');
  p.write('"Timestamp":"2016-01-07T02:59:28.6909359Z",');
  p.write('"DoubleValue":1.0,');
  p.write('"DoubleLargeValue":1234567898765432123456.0123456789876543210,');
  p.write('"Int32Value":2,');
  p.write('"Int64Value@odata.type":"Edm.Int64",');
  p.write('"Int64Value":1234567890123456789');
  p.write('}');
});
