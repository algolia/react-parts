/*jshint esnext:true, node:true */
'use strict';
var keys = require('./../keys.json');
var AlgoliaSearch = require('algoliasearch');
var AlgoliaClient = AlgoliaSearch(keys.algolia.appId, keys.algolia.apiKey);
var AlgoliaIndex = AlgoliaClient.initIndex('react-parts');

function getSearchResults({ query = '', type = 'native-ios', page = 0, perPage = 20 }) {

  return AlgoliaIndex.search(query, { 
    facets: ['type'],
    facetFilters: ['type:' + type],
    hitsPerPage: perPage,
    page: page
  }).then(function(content) {
    content.hits = content.hits.map(function(hit) {
      hit.modified = new Date(hit.modified).toISOString();
      hit.name = hit._highlightResult.name.value;
      hit.description = hit._highlightResult.description_encoded.value;
      hit.githubUser = hit._highlightResult.githubUser.value;
      delete hit._highlightResult;
      return hit;
    });
    return content;
  });
}

export default getSearchResults;

