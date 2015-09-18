/*jshint esnext:true, browserify:true */
'use strict';

import 'babel/polyfill';
import 'isomorphic-fetch';
import AlgoliaSearch from 'algoliasearch';
import React from 'react/addons';
import Router from 'react-router';
import StylingMixin from './styling-mixin.jsx';
import Navbar from './navbar-component.jsx';
import ComponentList from './list-component.jsx';
import {Tabs, Tab} from './tabs-component.jsx';
import Pagination from './pagination-component.jsx';
import Scroller from './scroller-component.jsx';
import Footer from './footer-component.jsx';
import getSearchResults from './get-search-results'
import sortBy from './sort';

let Route = Router.Route;
let RouteHandler = Router.RouteHandler;
let AlgoliaClient = AlgoliaSearch('MXM0JWJNIW', 'e8bc1168c9537faebb06361c85adae98');
let AlgoliaIndices = {
  'web' : AlgoliaClient.initIndex('react-parts_web'),
  'native-ios' : AlgoliaClient.initIndex('react-parts_native-ios')
}

export var App = React.createClass({
  mixins: [StylingMixin],
  contextTypes: {
    router: React.PropTypes.func
  },
  propTypes: {
    components: React.PropTypes.array.isRequired,
    currentPage: React.PropTypes.number,
    debugMode: React.PropTypes.bool,
    perPage: React.PropTypes.number,
    searchQuery: React.PropTypes.string,
    totalItems: React.PropTypes.number,
    type: React.PropTypes.string
  },
  getDefaultProps() {
    return {
      currentPage: 0,
      debugMode: false,
      perPage: 2
    };
  },
  getInitialState() {
    return {
      components: this.props.components,
      currentPage: this.props.currentPage,
      searchQuery: this.props.searchQuery,
      totalItems: this.props.totalItems,
      type: this.props.type
    };
  },
  render() {
    let title = "React.parts";
    let type = this.state.type;
    let components = this.state.components;
    let debugMode = this.props.debugMode;

    let styles = {
      container:  {
        fontFamily: "Source Sans Pro, sans-serif",
        fontSize: this.remCalc(20),
        lineHeight: "1.5",
        cursor: "default"
      },
      content: {
        margin: "0 auto",
        fontSize: this.remCalc(15),
        maxWidth: this.remCalc(800),
        padding: this.remCalc(50, 10, 10)
      }
    };
    return (
      <Scroller className="scrollable" position={ debugMode ? "same" : "top" } style={styles.container}>
        <Navbar title={title} height={this.remCalc(55)} onSearch={this.handleSearch} />

        <div style={styles.content}>
          <Tabs>
            <Tab to="components" params={{type: "native-ios"}}>React Native</Tab>
            <Tab to="components" params={{type: "web"}}>React for Web</Tab>
          </Tabs>

          <RouteHandler components={components} debugMode={debugMode} />


          <Footer />
        </div>
      </Scroller>
    );
  },

          // <Pagination
          //   to="components"
          //   params={{ type }}
          //   currentPage={this.props.currentPage}
          //   perPage={this.props.perPage}
          //   totalItems={this.props.totalItems}
          // />
  componentWillReceiveProps(newProps) {
    var type = newProps.params.type;
    var searchQuery = this.state.searchQuery;
    this.handleSearch({ searchQuery, type});
  },
  handleSearch({searchQuery = '', type = this.state.type}) {
    var searchOptions = {
      query: searchQuery,
      type: type,
      page: this.state.currentPage,
      perPage: this.props.perPage
    }
    getSearchResults(searchOptions).then((data) => {
      this.setState({ 
        type: type,
        searchQuery: searchQuery,
        components: data.hits,
        totalItems: data.nbHits,
        currentPage: data.page
      });
    });
  },
  currentPage() {
    var currentPage = parseInt(this.props.query.page); // May return NaN
    if (isNaN(currentPage)) currentPage = 1; // This works, even for 0
    return currentPage;
  }
});

export var routes = (
  <Route name="app" path="/" handler={App}>
    <Route name="components" path=":type" handler={ComponentList} />
  </Route>
);

if (typeof(document) !== "undefined") {
  Router.run(routes, Router.HistoryLocation, function(Handler, state) {
    React.render(
      <Handler {...state} {...window.initialData} />,
      document.getElementById("container")
    );
  });
}
