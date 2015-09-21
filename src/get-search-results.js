/*jshint esnext:true, node:true */
'use strict';
var keys = require('./../keys.json');
var AlgoliaSearch = require('algoliasearch');
var AlgoliaClient = AlgoliaSearch(keys.algolia.appId, keys.algolia.apiKey);
// var AlgoliaIndex = AlgoliaClient.initIndex('react-parts');

function getSearchResults({ query = '', type = 'native-ios', page = 0, perPage = 20 }) {
  var searches = [
    // Facetted query on this type, to display results
    {
      indexName: 'react-parts',
      query: query,
      params: {
        facets: ['type'],
        facetFilters: ['type:' + type],
        hitsPerPage: perPage,
        page: page
      }
    },
    // Full query on the index to get the number of results per type
    {
      indexName: 'react-parts',
      query: query,
      params: {
        facets: ['type'],
        hitsPerPage: 1,
        page: 0,
        attributesToRetrieve: ['type']
      }
    }
  ]

  return AlgoliaClient.search(searches).then(function(data) {
    var searchResponse = data.results[0];
    var statsResponse = data.results[1];

    // Search results
    var searchResults = searchResponse.hits.map(function(hit) {
      hit.modified = new Date(hit.modified).toISOString();
      hit.name = hit._highlightResult.name.value;
      hit.description = hit._highlightResult.description_encoded.value;
      hit.githubUser = hit._highlightResult.githubUser.value;
      delete hit._highlightResult;
      return hit;
    });

    var nativeCount = (statsResponse.facets.type && statsResponse.facets.type['native-ios']) || 0;
    var webCount = (statsResponse.facets.type && statsResponse.facets.type['web']) || 0;

    return {
      components: searchResults,
      count: {
        'native-ios': nativeCount,
        web: webCount
      },
      page: searchResponse.page
    }
  });
}

export default getSearchResults;

