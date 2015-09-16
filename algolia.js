/*jshint node:true, unused:true */
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
  return Math.floor(new Date(date).getTime() / 1000);
}


function formatRecordsForSearch(records) {
  return records.map(function(record) {
    record.keywords = record.keywords.split(',');
    record.created = stringDateToUnixTimestamp(record.created);
    record.modified = stringDateToUnixTimestamp(record.modified);
    return record;
  });
}


function pushJSON(jsonFile, indexName) {
  var records = require(jsonFile);
  var index = client.initIndex(indexName);
  configureIndex(index);

  records = formatRecordsForSearch(records);

  console.log('Pushing ' + records.length + ' records on ' + indexName);
  arrayChunk(records, 500).forEach(function(chunkedRecords, chunkIndex) {
    index.addObjects(chunkedRecords, function(err) {
      var chunkName = 'chunk #' + chunkIndex + ' of ' + indexName;
      if (err) {
        console.log('An error occured when pushing ' + chunkName);
      }
      console.log('Added ' + chunkName);
    });
  });
}

function configureIndex(index) {
  index.setSettings({
    attributesToIndex: [
      'name',
      'description',
      'unordered(keywords)',
      'githubUser',
      'repo,homepage'
    ],
    attributesForFacetting: [
      'keywords',
      'githubUser'
    ],
    customRanking: [
      'desc(downloads)',
      'desc(stars)',
      'desc(modified)',
      'desc(created)'
    ],
    minWordSizefor1Typo: 3,
    minWordSizefor2Typos: 7,
    hitsPerPage: 20,
    highlightPreTag: '<mark>',
    highlightPostTag: '</mark>'
  }, function(err) {
    if (err) {
      console.log('An error occured when setting the index settings');
    }
  });
}

pushJSON('./components/react-web.json', 'react-parts_web');
pushJSON('./components/react-native-ios.json', 'react-parts_native-ios');
