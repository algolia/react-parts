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
    initialComponents: React.PropTypes.object.isRequired,
    perPage: React.PropTypes.number,
    debugMode: React.PropTypes.bool
  },
  getDefaultProps() {
    return {
      perPage: 20,
      debugMode: true
    };
  },
  getInitialState() {
    return {
      components: this.props.initialComponents,
      filtered: this.props.initialComponents[this.props.params.type],
      searchQuery: "",
    };
  },
  render() {
    let title = "React.parts";
    let type = this.props.params.type;
    let components = this.state.filtered;
    let componentsForPage = this.componentsForPage(components);

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
      <Scroller className="scrollable" position={ this.props.debugMode ? "same" : "top" } style={styles.container}>
        <Navbar title={title} height={this.remCalc(55)} onSearch={this.handleSearch} />

        <div style={styles.content}>
          <Tabs>
            <Tab to="components" params={{type: "native-ios"}}>React Native</Tab>
            <Tab to="components" params={{type: "web"}}>React for Web</Tab>
          </Tabs>

          <RouteHandler components={componentsForPage} debugMode={this.props.debugMode} />

          <Pagination
            to="components"
            params={{ type }}
            currentPage={this.currentPage()}
            perPage={this.props.perPage}
            totalItems={components.length}
          />

          <Footer />
        </div>
      </Scroller>
    );
  },
  componentWillReceiveProps(newProps) {
    let type = newProps.params.type;
    let components = this.state.components;
    let searchQuery = this.state.searchQuery;

    // If the user changed tab, and we don't have the data, fetch it
    if (!components[type] || components[type].length === 0) {
      window.fetch(`/api/components/${type}`).then((response) => {
        response.json().then((data) => {
          components[type] = data;
          // Update both the complete and filtered components lists
          let filtered = this.filterForSearch(components[type], searchQuery);
          this.setState({ components, filtered });
        });
      });
    } else {
      // We already have the data, simply reset the search filters
      let filtered = this.filterForSearch(components[type], searchQuery);
      this.setState({ filtered });
    }
  },
  handleSearch(searchQuery) {
    var type = this.props.params.type;
    var index = AlgoliaIndices[type];
    var self = this;
    index.search(searchQuery, function(err, data) {
      var filtered = data.hits.map(function(result) {
        result.modified = new Date(result.modified).toISOString()
        return result;
      });
      self.setState({ filtered, searchQuery });
    });
  },
  currentPage() {
    var currentPage = parseInt(this.props.query.page); // May return NaN
    if (isNaN(currentPage)) currentPage = 1; // This works, even for 0
    return currentPage;
  },
  componentsForPage(items) {
    let i = Math.max(0, (this.currentPage() - 1) * this.props.perPage);
    let j = Math.max(0, this.currentPage() * this.props.perPage);
    return items.slice(i, j);
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
      <Handler {...state}
        initialComponents={window.initialComponents}
        debugMode={window.debugMode}
      />,
      document.getElementById("container")
    );
  });
}
