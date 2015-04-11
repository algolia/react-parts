/*jshint esnext:true, browserify:true, unused:true */
'use strict';

import React from 'react/addons';
import Router from 'react-router';
import StylingMixin from './styling-mixin.jsx';

let Link = Router.Link;

export let Tab = React.createClass({
  mixins: [StylingMixin],
  propTypes: {
    disabled: React.PropTypes.bool
  },
  getDefaultProps() {
    return {
      disabled: false
    };
  },
  render() {
    let styles = {
      tab: {
        WebkitBoxFlex: 1,
        flex: 1,
        textAlign: "center",
        textTransform: "uppercase",
        letterSpacing: this.remCalc(1),
        textDecoration: "none",
        color: "#828282",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        display: "block",
        padding: this.remCalc(15, 20)
      },
      selectedTab: {
        background: "#fff",
        color: "#05a5d1"
      },
      disabledTab: {
        color: "#ccc"
      }
    };
    if (!this.props.disabled) {
      return (
        <Link
          {...this.props}
          style={styles.tab}
          activeStyle={this.mergeStyles(
            styles.tab,
            styles.selectedTab
          )}>
            {this.props.children}
        </Link>
      );
    } else {
      return (
        <div style={this.mergeStyles(
          styles.tab,
          styles.disabledTab
        )}>
          {this.props.children}
        </div>
      );
    }
  }
});

export let Tabs = React.createClass({
  mixins: [StylingMixin],
  render() {
    let styles = {
      container: {
        background: "#f6f6f6",
        boxShadow: "0 1px 2px rgba(0,0,0,.2)",
        display: "flex",
        margin: 1
      },
    };
    return (
      <div style={styles.container} className="Tabs">
        {this.props.children}
      </div>
    );
  }
});