/*jshint esnext:true, browserify:true, unused:true, devel:true */
'use strict';

import React from 'react/addons';
import StylingMixin from './styling-mixin.jsx';
import Icon from './icon-component.jsx';
import TimeAgo from './timeago-component.jsx';

let PureRenderMixin = React.addons.PureRenderMixin;

let ComponentItem = React.createClass({
  mixins: [StylingMixin, PureRenderMixin],
  propTypes: {
    description: React.PropTypes.string,
    githubUser: React.PropTypes.string.isRequired,
    homepage: React.PropTypes.string.isRequired,
    latestVersion: React.PropTypes.string.isRequired,
    modified: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    stars: React.PropTypes.number.isRequired,
    debugMode: React.PropTypes.bool
  },
  getDefaultProps() {
    return {
      debugMode: false
    };
  },
  render() {
    let styles = {
      container: {
        MozUserSelect: "none",
        WebkitUserSelect: "none",
        background: "#fff",
        display: "block",
        margin: 1,
        padding: this.remCalc(12, 16, 14),
        textDecoration: "none"
      },
      header: {
        alignItems: "center",
        boxSizing: "border-box",
        display: "flex",
        marginBottom: this.remCalc(4)
      },
      title: {
        WebkitBoxFlex: 1,
        flex: 1,
        fontSize: this.remCalc(15),
        fontWeight: 200,
        margin: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      },
      name: {
        fontSize: this.remCalc(17),
        fontWeight: 600,
        textDecoration: "none"
      },
      metadata: {
        color: "#aaa",
        fontSize: this.remCalc(15),
        paddingLeft: this.remCalc(4)
      },
      stats: {
        color: "#000",
        fontSize: this.remCalc(15),
        paddingLeft: this.remCalc(8)
      },
      description: {
        color: "#000",
        margin: 0
      }
    };

    if (this.props.debugMode) {
      ['description', 'modified', 'stars'].forEach((prop) => {
        if (typeof this.props[prop] == "undefined")
          console.log(`Undefined ${ prop } for ${ this.props.repo }`);
      });
    }
    return (
      <a className="ComponentItem" style={styles.container} href={this.props.homepage}>
        <div className="ComponentItem-header" style={styles.header}>
          <h3 style={styles.title}>
            <span style={styles.name} dangerouslySetInnerHTML={{__html: this.props.name}}></span>
            <small>
              <span style={styles.metadata}>by <span dangerouslySetInnerHTML={{__html: this.props.githubUser}}></span></span>
              <TimeAgo dateTime={this.props.modified} style={styles.metadata} />
            </small>
          </h3>
          <div style={styles.stats}>
            <Icon icon="stars" />
            <span>{this.props.stars}</span>
          </div>
          <div style={styles.stats}>
            <Icon icon="cloud-download" />
            <span>{this.props.downloads}</span>
          </div>
          <div style={styles.stats}>
            <Icon icon="versions" />
            <span>v{this.props.latestVersion}</span>
          </div>
        </div>
        <p style={styles.description} dangerouslySetInnerHTML={{__html: this.props.description}}></p>
      </a>
    );
  }
});

export default ComponentItem;
