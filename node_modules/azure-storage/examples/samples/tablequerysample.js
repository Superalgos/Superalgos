var fs = require('fs');
var assert = require('assert');
var util = require('util');
var http = require('http');

var azure;
if (fs.existsSync('absolute path to azure-storage.js')) {
  azure = require('absolute path to azure-storage');
} else {
  azure = require('azure-storage');
}

var TableQuery = azure.TableQuery;
var TableUtilities = azure.TableUtilities;
var eg = TableUtilities.entityGenerator;

var tableName = 'tablequerysample';
var tableService = azure.createTableService();

// optionally set a proxy
/*var proxy = {
  protocol: 'http:',
  host: '127.0.0.1',
  port: 8888
};

tableService.setProxy(proxy);*/

var entity1 = {
  PartitionKey: eg.String('partition1'),
  RowKey: eg.String('row1'),
  integerfield: eg.Int32(1),
  stringfield: eg.String('stringfield value'),
  longfield: eg.Int64('92233720368547758')
};

var entity2 = {
  PartitionKey: eg.String('partition1'),
  RowKey: eg.String('row2'),
  stringfield: eg.String('stringfield value'),
  longfield: eg.Int64('8547758')
};

function performTableQuery() {
  // Create the table
  tableService.createTable(tableName, function (error1) {
    assert.equal(error1, null);

    // Insert the entities
    insertEntities(function() {

      // Return all entities
      queryAllEntities(function () {

        // Return entities Where certain conditions are met
        queryEntitiesWhere(function () {

          // Return the Top n entities
          queryEntitiesTop(function () {

            // Return Select fields from entities
            queryEntitiesSelect(function () {

              // Delete the table
              tableService.deleteTable(tableName, function (error2) {
                assert.equal(error2, null);
              });
            });
          });
        });
      });
    });
  });
}

function insertEntities(callback) {
  // insert the entities
  tableService.insertEntity(tableName, entity1, function (error1) {
    assert.equal(error1, null);
    tableService.insertEntity(tableName, entity2, function (error2) {
      assert.equal(error2, null);
      callback();
    });
  });
}

function queryAllEntities(callback) {
  // Select all fields
  tableService.queryEntities(tableName, null, null, function (error, result) {
    assert.equal(error, null);
    assert.notEqual(result, null);
    assert.notEqual(result.entries, null);

    var entities = result.entries;
    assert.equal(entities.length, 2);
    var entityResult = entities[0];
    assert.equal(entityResult.stringfield._, entity1.stringfield._);
    assert.equal(entityResult.longfield._, entity1.longfield._);

    callback();
  });
}

function queryEntitiesWhere(callback) {
  // Select only the entries where the longfield is great than 10,000,000

  // equivalently: var tableQuery = new TableQuery().where('longfield == ?int64?', '10000000');
  var tableQuery = new TableQuery().where(TableQuery.int64Filter('longfield', TableUtilities.QueryComparisons.GREATER_THAN, '10000000'));

  tableService.queryEntities(tableName, tableQuery, null, function (error, result) {
    assert.equal(error, null);
    assert.notEqual(result, null);
    assert.notEqual(result.entries, null);

    var entities = result.entries;
    assert.equal(entities.length, 1);

    var entityResult = entities[0];
    assert.equal(entityResult.longfield._, entity1.longfield._);

    callback();
  });
}

function queryEntitiesTop(callback) {
  // Select only the top entry
  var tableQuery = new TableQuery().top(1);

  tableService.queryEntities(tableName, tableQuery, null, function (error, result) {
    assert.equal(error, null);
    assert.notEqual(result, null);
    assert.notEqual(result.entries, null);

    var entities = result.entries;
    assert.equal(entities.length, 1);

    var entityResult = entities[0];
    assert.equal(entityResult.integerfield._, entity1.integerfield._);
    assert.equal(entityResult.longfield._, entity1.longfield._);

    callback();
  });
}

function queryEntitiesSelect(callback) {
  // Select specific field
  var tableQuery = new TableQuery().select('integerfield');

  tableService.queryEntities(tableName, tableQuery, null, function (error, result) {
    assert.equal(error, null);
    assert.notEqual(result, null);
    assert.notEqual(result.entries, null);

    var entities = result.entries;
    assert.equal(entities.length, 2);

    var entityResult = entities[0];
    assert.equal(entityResult.integerfield._, entity1.integerfield._);
    assert.equal(entityResult.longfield, undefined);

    callback();
  });
}

performTableQuery();