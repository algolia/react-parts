/*jshint node:true, unused:true */
// TODO
// Switch d'un tab à l'autre
// Pousser les stars sur native
// Mettre l'ihighlight
// Régler le first load (chargement server-side et return?)
var ent = require('ent');
var keys = require('./keys.json');
var algoliasearch = require('algoliasearch');
var client = algoliasearch(keys.algolia.appId, keys.algolia.apiKey);


function arrayChunk(list, chunkSize) {
  var chunks = [];
  var max = list.length;
  var i = 0;

  while (i < max) {
    chunks.push(list.slice(i, i += chunkSize));
  }
  return chunks;
}

function stringDateToUnixTimestamp(date) {
  return Math.floor(new Date(date).getTime());
}


function formatRecordsForSearch(records) {
  return records.map(function(record) {
    record.keywords = record.keywords.split(',');
    record.created = stringDateToUnixTimestamp(record.created);
    record.modified = stringDateToUnixTimestamp(record.modified);
    // We seem to have a bug in the API where _highlightResult gets htmldecoded
    // automatically, so we need to encode it once to have a version safe for
    // display
    record.description_encoded = ent.encode(ent.encode(record.description || ''));
    return record;
  });
}

function promiseLog(text) {
  return function(req) {
    console.log(text);
    return req;
  };
}

function pushDataToAlgolia(jsonFile, indexName) {
  var indexNameTmp = indexName + '_tmp';
  var records = require(jsonFile);
  var indexTmp = client.initIndex(indexNameTmp);
  records = formatRecordsForSearch(records);

  configureIndex(indexTmp)
    .then(promiseLog('[' + indexNameTmp +']: Configured index'))
    .then(pushRecords(records, indexTmp))
    .then(promiseLog('[' + indexNameTmp +']: Pushed all chunks'))
    .then(overwriteTmpIndex(client, indexNameTmp, indexName))
    .then(promiseLog('[' + indexNameTmp +']: Delete tmp index'));
}

function configureIndex(index) {
  return index.setSettings({
    attributesToIndex: [
      'name',
      'description',
      'unordered(keywords)',
      'githubUser',
      'repo,homepage',
      'description_encoded' // To have highlight in it
    ],
    attributesToRetrieve: [
      'description_encoded',
      'downloads',
      'githubUser',
      'homepage',
      'latestVersion',
      'modified',
      'name',
      'stars'
    ],
    attributesForFacetting: [
      'keywords',
      'githubUser'
    ],
    customRanking: [
      'desc(stars)',
      'desc(downloads)',
      'desc(modified)',
      'desc(created)'
    ],
    minWordSizefor1Typo: 3,
    minWordSizefor2Typos: 7,
    hitsPerPage: 20,
    highlightPreTag: '<mark>',
    highlightPostTag: '</mark>'
  });
}
function pushRecords(records, index) {
  var pushOrders = [];

  arrayChunk(records, 500).forEach(function(chunkedRecords) {
    pushOrders.push(index.addObjects(chunkedRecords));
  });

  return function() {
    return Promise.all(pushOrders);
  };
}
function overwriteTmpIndex(client, indexNameTmp, indexName) {
  return function() {
    return client.moveIndex(indexNameTmp, indexName)
      .then(client.deleteIndex(indexNameTmp));
  };
}

pushDataToAlgolia('./components/react-web.json', 'react-parts_web');
pushDataToAlgolia('./components/react-native-ios.json', 'react-parts_native-ios');
